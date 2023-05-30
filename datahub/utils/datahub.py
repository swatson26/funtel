import logging
import pandas as pd
import ulmo
import datetime
from datahub.scripts.db_manager import DatabaseManager
from concurrent.futures import ThreadPoolExecutor, as_completed


class SnotelDataFetcher:
    """
    Fetches SNOTEL data from an external service and handles data retrieval and processing.

    This class provides methods to fetch SNOTEL data for all sites or a specific site.
    It utilizes the ulmo library to retrieve data from an external web service.
    The retrieved data is then processed and stored in a database using the DatabaseManager.

    Attributes:
        wsdl_url (str): The URL of the external web service.
        db_manager (DatabaseManager): The instance of the DatabaseManager class.

    """
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        # Suppress logging for suds and suds-jurko
        logging.getLogger('suds').setLevel(logging.CRITICAL)
        logging.getLogger('suds.client').setLevel(logging.CRITICAL)
        logging.getLogger('suds_jurko').setLevel(logging.CRITICAL)

        # Create a custom null handler to suppress log messages
        class NullHandler(logging.Handler):
            def emit(self, record):
                pass

        # Add the null handler to the root logger
        logging.getLogger().addHandler(NullHandler())

        self.wsdl_url = "https://hydroportal.cuahsi.org/Snotel/cuahsi_1_1.asmx?WSDL"
        self.db_manager = DatabaseManager()

    def get_all_sites(self, add_to_db, state_list=['CO']):
        """
        Fetches data for all SNOTEL sites.

        This method retrieves data for all SNOTEL sites from an external service.
        It then processes and returns the site data in a list format.

        Returns:
            list: A list of dictionaries containing the site data.
        """
        try:
            site_data = ulmo.cuahsi.wof.get_sites(self.wsdl_url)
            all_site_data = []

            for snotel_name in site_data.keys():
                site_info = site_data[snotel_name]

                if 'location' in site_info.keys():
                    state_code = snotel_name.split('_')[1]
                    if state_code in state_list:
                        all_site_data.append({
                            'site_id': snotel_name,
                            'name': site_info['name'],
                            'lat': site_info['location']['latitude'],
                            'lon': site_info['location']['longitude'],
                            'elevation_m': site_info['elevation_m']
                        })

            self.all_sites = all_site_data

        except Exception as e:
            self.logger.error("An error occurred while fetching SNOTEL site data: %s", str(e))
            return []
        if add_to_db:
            self.db_manager.insert_snotel_sites(self.all_sites)


    def get_site_data(self, site_id, start_timestamp, end_timestamp=None):
        """
        Fetches data for a specific SNOTEL site.

        This method retrieves data for a specific SNOTEL site within the given time range
        from an external service. It fetches snow depth and temperature data for the site.

        Args:
            site_id (str): The ID of the SNOTEL site.
            start_timestamp (datetime.datetime): The start timestamp for data retrieval.
            end_timestamp (datetime.datetime, optional): The end timestamp for data retrieval.
                If not provided, the current UTC time will be used. Defaults to None.
        """
        try:
            start_str = start_timestamp.strftime('%Y-%m-%d')

            if end_timestamp is None:
                end_timestamp = datetime.datetime.utcnow()

            end_str = end_timestamp.strftime('%Y-%m-%d')
            snow_depth = ulmo.cuahsi.wof.get_values(wsdl_url=self.wsdl_url,
                                                    site_code=site_id,
                                                    variable_code='SNOTEL:SNWD_H',
                                                    start=start_str,
                                                    end=end_str)

            temp = ulmo.cuahsi.wof.get_values(wsdl_url=self.wsdl_url,
                                              site_code=site_id,
                                              variable_code='SNOTEL:TOBS_H',
                                              start=start_str,
                                              end=end_str)

            temp_df = pd.DataFrame(temp['values']).loc[:,['value', 'date_time_utc']]
            temp_df['value'] = temp_df['value'].astype(float)
            temp_df['date_time_utc'] = pd.to_datetime(temp_df['date_time_utc'])
            temp_df = temp_df.rename(columns={'value':'temp'})

            snow_depth_df = pd.DataFrame(snow_depth['values']).loc[:,['value', 'date_time_utc']]
            snow_depth_df['value'] = snow_depth_df['value'].astype(float)
            snow_depth_df['date_time_utc'] = pd.to_datetime(snow_depth_df['date_time_utc'])
            snow_depth_df = snow_depth_df.rename(columns={'value':'snow_depth'})
            data_df = pd.merge(snow_depth_df, temp_df, on='date_time_utc')
           
            return data_df

        except Exception as e:
            self.logger.error("An error occurred while fetching SNOTEL site data for site '%s': %s", site_id, str(e))
            return None

    def get_all_site_data(self, add_to_db, offset_hrs):
        """
        Fetches data for all SNOTEL sites.

        This method retrieves data for all SNOTEL sites by calling the `get_site_data` method.
        It returns a dictionary with site IDs as keys and the corresponding data as values.

        Args:
            add_to_db (bool): if True, will upsert new snotel data to db
            offset_yrs (int, optional): The number of years to go back from the current time
                to retrieve site data. Defaults to 5.

        Returns:
            dict: A dictionary containing site IDs as keys and data as values.
        """
        all_site_data = []
        self.logger.debug('getting all sites')
        self.get_all_sites(add_to_db=False)
        self.logger.debug(f'starting get_all_site_data for {offset_hrs} hours')

        start_timestamp = datetime.datetime.utcnow() - datetime.timedelta(hours=offset_hrs)
        end_timestamp = datetime.datetime.utcnow()

        chunk_size = 20
        num_chunks = (len(self.all_sites) + chunk_size - 1) // chunk_size

        self.logger.debug(f'Total number of chunks: {num_chunks}')

        for chunk_index in range(num_chunks):
            chunk_start = chunk_index * chunk_size
            chunk_end = (chunk_index + 1) * chunk_size
            chunk_sites = self.all_sites[chunk_start:chunk_end]

            self.logger.info(f"Processing chunk {chunk_index+1} of {num_chunks}")

            with ThreadPoolExecutor() as executor:
                future_to_site_id = {
                    executor.submit(self.get_site_data, site['site_id'], start_timestamp, end_timestamp): site
                    for site in chunk_sites
                }

                for future in as_completed(future_to_site_id):
                    site = future_to_site_id[future]
                    try:
                        data_df = future.result()
                        if data_df is not None:
                            data_df['snotel_site_id'] = site['site_id']
                            all_site_data.append(data_df)
                            self.logger.info(f"Completed fetching data for site '{site['site_id']}'")
                    except Exception as e:
                        self.logger.error(
                            f"An error occurred while fetching SNOTEL site data for site '{site['site_id']}': {str(e)}")

            if add_to_db:
                self.db_manager.insert_snotel_data(pd.concat(all_site_data))

        all_site_data = pd.concat(all_site_data)

        return all_site_data
