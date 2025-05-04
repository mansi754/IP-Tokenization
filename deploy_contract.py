from algosdk.v2client import algod
from algosdk import account, mnemonic
from algosdk.future.transaction import ApplicationCreateTxn, OnComplete
from algosdk.logic import get_application_address
import json
import os
import base64
from pyteal import *

# Initialize Algod client
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
algod_client = algod.AlgodClient(algod_token, algod_address)

# Load contract
def load_contract():
    with open("artifacts/contract.json", "r") as f:
        return json.load(f)

# Get account info
def get_account_info(private_key):
    return account.address_from_private_key(private_key)

# Deploy contract
def deploy_contract(creator_private_key):
    # Load contract
    contract = load_contract()

    # Get creator address
    creator_address = get_account_info(creator_private_key)

    # Get suggested params
    params = algod_client.suggested_params()

    # Create application create transaction
    txn = ApplicationCreateTxn(
        sender=creator_address,
        sp=params,
        on_complete=OnComplete.NoOpOC,
        approval_program=base64.b64decode(contract["approval_program"]),
        clear_program=base64.b64decode(contract["clear_program"]),
        global_schema=contract["global_schema"],
        local_schema=contract["local_schema"]
    )

    # Sign transaction
    signed_txn = txn.sign(creator_private_key)

    # Submit transaction
    tx_id = algod_client.send_transaction(signed_txn)

    # Wait for confirmation
    try:
        transaction_response = algod_client.wait_for_confirmation(tx_id, 4)
        app_id = transaction_response['application-index']
        print(f"Contract deployed successfully! App ID: {app_id}")
        return app_id
    except Exception as e:
        print(f"Error deploying contract: {e}")
        return None

if __name__ == "__main__":
    # Get creator private key from environment variable
    creator_private_key = os.getenv("CREATOR_PRIVATE_KEY")
    if not creator_private_key:
        print("Error: CREATOR_PRIVATE_KEY environment variable not set")
        exit(1)

    # Deploy contract
    app_id = deploy_contract(creator_private_key)
    if app_id:
        print(f"Contract deployed with App ID: {app_id}")
        print(f"Contract address: {get_application_address(app_id)}")
