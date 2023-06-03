import logging
import pandas as pd
from io import StringIO
import requests
import aiohttp
import asyncio
from datahub.scripts.db_manager import DatabaseManager
from aiohttp import ClientError
from datetime import datetime, timedelta
from pytz import timezone


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
}

class SnotelDataFetcher:
    """
    Fetches SNOTEL data from an external service and handles data retrieval and processing.

    This class provides methods to fetch SNOTEL data for all sites or a specific site.
    It utilizes the ulmo library to retrieve data from an external web service.
    The retrieved data is then processed and stored in a database using the DatabaseManager.

    Attributes:
        db_manager (DatabaseManager): The instance of the DatabaseManager class.

    """

    def __init__(self):
        self.logger = logging.getLogger('testlogger')
        self.db_manager = DatabaseManager()
        self.all_sites = None

    async def _fetch_data(self, session, url):
        """
        Fetches data from the specified URL using the provided session.

        Args:
            session (aiohttp.ClientSession): The aiohttp ClientSession object.
            url (str): The URL to fetch the data from.

        Returns:
            str: The fetched data as text.
        """
        async with session.get(url) as response:
            return await response.text()

    async def _get_data(self, id, start_date=None, end_date=None):
        """
        Retrieves SNOTEL data for a specific site.

        Args:
            id (str): The site ID.
            start_date (str): The start date for data retrieval.
            end_date (str): The end date for data retrieval.

        Returns:
            pd.DataFrame: The retrieved SNOTEL data as a DataFrame.
        """
        trimmed_id = id.replace('SNOTEL:', '').replace('_', ':')
        base_url = "https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/"
        url = f"{base_url}start_of_period/{trimmed_id}%7Cid=%22%22%7Cname/{start_date},{end_date}/WTEQ::value,SNWD::value,PREC::value,TOBS::value"

        async with aiohttp.ClientSession() as session:
            try:
                data = await self._fetch_data(session, url)
                lines = [line for line in data.split('\n') if not line.startswith('#')]
                clean_text = '\n'.join(lines)
                df = pd.read_csv(StringIO(clean_text))
                df['site_id'] = id
                return df
            except (aiohttp.ClientError, aiohttp.ServerTimeoutError) as e:
                self.logger.error("An error occurred while fetching SNOTEL data for site %s: %s", id, str(e))
                return None

    async def _get_snotel_data(self, site_ids, start_date=None, end_date=None):
        """
        Retrieves SNOTEL data for multiple sites.

        Args:
            site_ids (list): List of site IDs.
            start_date (str): The start date for data retrieval.
            end_date (str): The end date for data retrieval.

        Returns:
            pd.DataFrame: The retrieved SNOTEL data as a DataFrame.
        """
        tasks = []
        async with aiohttp.ClientSession() as session:
            for site_id in site_ids:
                task = asyncio.create_task(self._get_data(site_id, start_date, end_date))
                tasks.append(task)

            results = await asyncio.gather(*tasks)
            df = pd.concat(results, ignore_index=True)

            return df

    def get_all_sites(self, add_to_db, state_list=['CO']):
        """
        Fetches data for all SNOTEL sites.

        This method retrieves data for all SNOTEL sites from an external service.
        It then processes and returns the site data in a list format.

        Args:
            add_to_db (bool): If True, the site data will be added to the database.
            state_list (list): List of state codes to filter the SNOTEL sites (default: ['CO']).

        Returns:
            list: A list containing the site data.
        """
        try:
            r = requests.get('https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customMultipleStationReport/daily/network=%22SNTL%22,%22SCAN%22,%22MSNT%22%20AND%20element=%22WTEQ%22%20AND%20outServiceDate=%222100-01-01%22%7Cname/0,0/stationId,state.code,network.code,name,elevation,latitude,longitude,county.name,huc12.huc,huc12.hucName,inServiceDate,outServiceDate?fitToScreen=false', 
                             headers=HEADERS)
            r.raise_for_status()
            data = r.text
            if len(data) <1:
                self.logger.debug(r.text)
            lines = [line for line in data.split('\n') if not line.startswith('#')]
            clean_text = '\n'.join(lines)
            df = pd.read_csv(StringIO(clean_text))
            df.columns = [c.replace(' ', '_') for c in df.columns]
            df['site_id'] = 'SNOTEL:' + df['Station_Id'].astype(str) + '_' + df['State_Code'] + '_' + df['Network_Code']
            df['name'] = df['Station_Name']
            df['lat'] = df['Latitude']
            df['lon'] = df['Longitude']
            df['elevation_ft'] = df['Elevation']
            df = df[df['State_Code'].isin(state_list)]
            df = df.loc[:, ['site_id', 'name', 'lat', 'lon', 'elevation_ft']]
            self.all_sites = df

        except (requests.RequestException, ValueError) as e:
            self.logger.error("An error occurred while fetching SNOTEL site data: %s", str(e))
            return []

        if add_to_db:
            self.db_manager.insert_snotel_sites(self.all_sites)

    async def get_all_site_data(self,
                                add_to_db,
                                offset_hrs=200,
                                retry_attempts=3):
        """
        Fetches data for all SNOTEL sites.

        This method retrieves data for all SNOTEL sites by calling the `_get_snotel_data` method.
        It returns a DataFrame containing all the site data.

        Args:
            add_to_db (bool): If True, the retrieved data will be added to the database.
            offset_hrs (int): The number of hours to go back from the current time
                to retrieve site data.
            retry_attempts (int): The number of retry attempts in case of errors.

        Returns:
            pd.DataFrame: A DataFrame containing the site data.
        """
        current_date = datetime.now()
        start_date = current_date - timedelta(hours=offset_hrs)
        end_date = current_date.strftime("%Y-%m-%d")
        start_date = start_date.strftime("%Y-%m-%d")
        self.logger.info(f'running for {start_date} to {end_date}')
        retry_count = 0
        while retry_count < retry_attempts:
            try:
                all_site_data = await self._get_snotel_data(self.all_sites['site_id'], start_date, end_date)
                break
            except (aiohttp.ClientError, aiohttp.ServerTimeoutError) as e:
                self.logger.error("An error occurred while fetching SNOTEL site data: %s", str(e))
                retry_count += 1
                if retry_count < retry_attempts:
                    self.logger.info("Retrying after 3 seconds...")
                    await asyncio.sleep(3)
                else:
                    self.logger.error("Exceeded retry attempts. Unable to fetch SNOTEL site data.")
                    return None

        all_site_data['timestamp'] = all_site_data['Date'].apply(lambda x: pd.to_datetime(x).tz_localize(timezone('America/Denver')))
        all_site_data['snow_depth'] = all_site_data['Snow Depth (in)']
        all_site_data['temp'] = all_site_data['Air Temperature Observed (degF)']
        all_site_data['snotel_site_id'] = all_site_data['site_id']
        all_site_data = all_site_data.loc[:,['snotel_site_id','temp','snow_depth','timestamp']]
        
        if add_to_db and all_site_data is not None:
            self.db_manager.insert_snotel_data(all_site_data)

        return all_site_data
