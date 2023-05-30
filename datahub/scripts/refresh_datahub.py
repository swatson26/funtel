
import datetime
from datahub.scripts.datahub import SnotelDataFetcher
from datahub.scripts.db_manager import DatabaseManager

def run(*args):
    ds = SnotelDataFetcher()
    data = ds.get_all_site_data(add_to_db=True, offset_hrs=int(args[0]))
