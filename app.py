from flask import Flask
from flask import request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/getbs',methods=['POST'])
def handoff():

    data = request.get_json()
    baseStationId = random.choice(data['signals'])
    return str(baseStationId)

if __name__ == '__main__':
    app.run()
