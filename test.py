import pandas as pd
import asyncio
import aiohttp

async def fetch_data(session, url):
    async with session.get(url) as response:
        return await response.text()

async def get_data(id, start_date=None, end_date=None):
    # Construct the URL for the API request
    
    base_url = "https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/"
    url = f"{base_url}{id}%7Cid%3D%22%22%7Cname/{start_date},{end_date}/WTEQ%3A%3Avalue%2CSNWD%3A%3Avalue/0"

    async with aiohttp.ClientSession() as session:
        data = await fetch_data(session, url)

 
        print(data)

        # Convert the data to a DataFrame
        df = pd.DataFrame(data)  # Check if the number of columns matches the data

        return df

async def get_snotel_data(site_ids, start_date=None, end_date=None):
    tasks = []
    async with aiohttp.ClientSession() as session:
        for site_id in site_ids:
            task = asyncio.create_task(get_data(site_id, start_date, end_date))
            tasks.append(task)

        results = await asyncio.gather(*tasks)
        df = pd.concat(results, ignore_index=True)  # Concatenate the individual DataFrames

        return df

async def your_method():
    site_ids = ["SNOTEL:305_CO_SNTL", "SNOTEL:970_CO_SNTL"]
    start_date = "2013-01-15"
    end_date = "2013-01-18"

    df = await get_snotel_data(site_ids, start_date, end_date)
    print(df)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    df = loop.run_until_complete(get_snotel_data(["SNOTEL:305_CO_SNTL","SNOTEL:970_CO_SNTL"], 
                                                start_date='2023-01-01', end_date='2023-05-30'))
    loop.close()
    print(df)