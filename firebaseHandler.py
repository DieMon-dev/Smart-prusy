import urequests

def send_to_firebase(url, data):
    headers = {
        'Content-Type': 'application/json'
    }
    print("Sending to URL:", url)  # Debug print
    response = urequests.post(url, json=data, headers=headers)
    print("Response:", response.text)  # Debug print
    return response.text


def update_firebase(url, path, data):
    full_url = f"{url}/{path}.json"
    response = urequests.post(full_url, json=data)
    print(response.text)
    response.close()
