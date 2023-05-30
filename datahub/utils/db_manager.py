from sqlalchemy import create_engine
from sqlalchemy.sql import text
from django.conf import settings
import logging
from django.db import transaction
from datahub.models import SnotelSite, SnotelData


logger = logging.getLogger(__name__)


class DatabaseManager:

    def __init__(self):
        connection_string = (
            f"postgresql://{settings.DATABASES['default']['USER']}:"
            f"{settings.DATABASES['default']['PASSWORD']}@"
            f"{settings.DATABASES['default']['HOST']}:"
            f"{settings.DATABASES['default']['PORT']}/"
            f"{settings.DATABASES['default']['NAME']}"
        )
        self.engine = create_engine(connection_string)
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)


    def insert_snotel_data(self, data_df):
        """
        Inserts SNOTEL data into the database.

        This method inserts the SNOTEL data into the database. It takes a DataFrame
        consisting of four columns: 'snotel_site', 'temp', 'snow_depth', and 'date_time_utc'.
        The method inserts a new row for each data entry in the DataFrame, only if there
        is no existing entry with the same 'snotel_site' and 'date_time_utc'.

        Args:
            data_df (pandas.DataFrame): DataFrame containing SNOTEL data.

        Returns:
            int: The number of rows inserted.
        """

        # Create a temporary table for batch insertion
        temp_table_name = 'temp_snotel_data'
        data_df.to_sql(temp_table_name, con=self.engine, if_exists='replace', index=False)

        # Perform the upsert logic using SQL
        sql = f"""
        INSERT INTO datahub_snoteldata (snotel_site_id, temp, snow_depth, timestamp_utc)
        SELECT ss.site_id, tsd.temp, tsd.snow_depth, tsd.date_time_utc
        FROM  {temp_table_name} AS tsd
        INNER JOIN datahub_snotelsite AS ss ON tsd.snotel_site_id = ss.site_id
        WHERE NOT EXISTS (
            SELECT 1
            FROM datahub_snoteldata AS sd
            WHERE sd.snotel_site_id = ss.site_id AND sd.timestamp_utc = tsd.date_time_utc
        )
        """
        with self.engine.connect() as connection:
            connection.execute(text(sql))
            connection.commit()

            # num_rows_inserted = connection.scalar()
            # logger.info(f"Inserted {num_rows_inserted} rows of SNOTEL data.")

        with self.engine.connect() as connection:
            drop_table_sql = f"DROP TABLE IF EXISTS {temp_table_name}"
            print(drop_table_sql)
            connection.execute(text(drop_table_sql))
            connection.commit()
            logger.info(f"temp tbl dropped")


    def insert_snotel_sites(self, sites_data):
        """
        Inserts SNOTEL sites into the database.

        This method inserts the SNOTEL sites into the database. It takes a list of dictionaries
        containing site data: 'site_id', 'name', 'lat', 'lon', 'elevation_m'. The method inserts
        a new row for each site in the list, only if there is no existing entry with the same 'site_id'.

        Args:
            sites_data (list): List of dictionaries containing SNOTEL site data.

        Returns:
            int: The number of sites inserted.
        """
        num_sites_inserted = 0
        with transaction.atomic():
            for site_data in sites_data:
                site_id = site_data['site_id']
                if not SnotelSite.objects.filter(site_id=site_id).exists():
                    SnotelSite.objects.create(
                        site_id=site_id,
                        name=site_data['name'],
                        lat=site_data['lat'],
                        lon=site_data['lon'],
                        elevation_m=site_data['elevation_m']
                    )
                    num_sites_inserted += 1
                    logger.debug(f"Inserted SNOTEL site with site_id: {site_id}")
                else:
                    logger.debug(f"Skipped duplicate SNOTEL site with site_id: {site_id}")
        logger.info(f"Inserted {num_sites_inserted} SNOTEL sites.")
        return num_sites_inserted