from algosdk.v2client import algod
from algosdk import account, mnemonic
from smart_contracts.ip_tokens.contract import IPTokenizationPlatform

def main():
    # Initialize the Algod client
    algod_address = "http://localhost:4001"
    algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    client = algod.AlgodClient(algod_token, algod_address)

    # Create an instance of the contract
    app = IPTokenizationPlatform()

    # Get suggested parameters
    params = client.suggested_params()

    # Deploy the contract
    try:
        app_client = app.create(client)
        print(f"Contract deployed with app ID: {app_client.app_id}")
        print(f"Contract address: {app_client.app_addr}")
    except Exception as e:
        print(f"Error deploying contract: {e}")

if __name__ == "__main__":
    main()
