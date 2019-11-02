import json
a={"data":[{"tine":1},{"time":2},{"time":3}]}

data=json.dumps(a)
data=json.loads(data)

print(len(data['data']))
