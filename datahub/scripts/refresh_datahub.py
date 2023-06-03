
import datetime
from datahub.scripts.datahub import SnotelDataFetcher
from datahub.scripts.db_manager import DatabaseManager
import asyncio

def run(*args):
    ds = SnotelDataFetcher()
    ds.get_all_sites(add_to_db=False)
    data = asyncio.run(ds.get_all_site_data(add_to_db=True, offset_hrs=int(args[0])))