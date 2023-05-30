import datetime
from datahub.scripts.datahub import SnotelDataFetcher
from datahub.scripts.db_manager import DatabaseManager

def run(*args):
    ds = SnotelDataFetcher()
    ds.get_all_sites(add_to_db=True, state_list=['CO'])
