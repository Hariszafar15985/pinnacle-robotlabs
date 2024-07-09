import threading
import requests
import random


def pushing():
    robots = [
        {"sku": "ZRK3FI", "instruments": {"MCL": random.randint(1, 3)}},
        {"sku": "123198", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123237", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123235", "instruments": {"MCL": random.randint(1, 3)}},
        {"sku": "123202", "instruments": {"ES": random.randint(1, 3)}},
        {"sku": "123214", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123216", "instruments": {"MCL": random.randint(1, 3)}},
        {"sku": "123203", "instruments": {"MNQ": random.randint(1, 3)}},
        {"sku": "123209", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123262", "instruments": {"ES": random.randint(1, 3)}},
        {"sku": "123229", "instruments": {"CL": random.randint(1, 3)}},
        {"sku": "123234", "instruments": {"MGC": random.randint(1, 3)}},
        {"sku": "123218", "instruments": {"GC": random.randint(1, 3)}},
        {"sku": "123199", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123254", "instruments": {"MYM": random.randint(1, 3)}},
        {"sku": "123205", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123231", "instruments": {"MCL": random.randint(1, 3)}},
        {"sku": "123213", "instruments": {"MNQ": random.randint(1, 3)}},
        {"sku": "123204", "instruments": {"MNQ": random.randint(1, 3)}},
        {"sku": "123232", "instruments": {"MGC": random.randint(1, 3)}},
        {"sku": "123212", "instruments": {"NQ": random.randint(1, 3)}},
        {"sku": "123251", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123252", "instruments": {"MGC": random.randint(1, 3)}},
        {"sku": "123253", "instruments": {"MES": random.randint(1, 3)}},
        {"sku": "123211", "instruments": {"MNQ": random.randint(1, 3)}},
        {"sku": "123208", "instruments": {"MNQ": random.randint(1, 3)}}
    ]

    levels = {"ES": random.randint(1, 3),
              "MES": random.randint(1, 3),
              "NQ": random.randint(1, 3),
              "MNQ": random.randint(1, 3),
              "YM": random.randint(1, 3),
              "MYM": random.randint(1, 3)
              }
    total = random.randint(1, len(robots))
    new_robots = []
    count = 0
    for i in robots:
        if count > total:
            break
        new_robots.append(i)
        count += 1
    months = random.randint(12, 120)
    post_data = {"months": months, "robots": new_robots, "levels": levels}
    res = requests.post('https://api.robotportfoliolab.com/robot/simulate/', json=post_data)
    print("------------------------------------------")
    print(f"Number of robots: {len(new_robots)} | Months: {months}")
    print(f"Status: {res.status_code}")
    print(f"Elapsed Time: {res.elapsed}")
    print('------------------------------------------')


if __name__ == '__main__':
    threads = list()
    for index in range(10):
        x = threading.Thread(target=pushing)
        threads.append(x)
        x.start()
