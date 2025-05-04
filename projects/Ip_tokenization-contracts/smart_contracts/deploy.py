from algosdk.v2client import algod, kmd
from algosdk import account, mnemonic
from algosdk import transaction
from algosdk.atomic_transaction_composer import *
from algosdk.abi import *
import json
import os
import base64

# Load the compiled contract
with open("smart_contracts/artifacts/ip_tokens/IPTokenizationPlatform.approval.teal", "r") as f:
    approval_program = f.read()

with open("smart_contracts/artifacts/ip_tokens/IPTokenizationPlatform.clear.teal", "r") as f:
    clear_program = f.read()

# Initialize clients
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
algod_client = algod.AlgodClient(algod_token, algod_address)

kmd_address = "http://localhost:4002"
kmd_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
kmd_client = kmd.KMDClient(kmd_token, kmd_address)

# Get the default wallet
wallets = kmd_client.list_wallets()
wallet_id = None
for wallet in wallets:
    if wallet["name"] == "unencrypted-default-wallet":
        wallet_id = wallet["id"]
        break

if not wallet_id:
    raise Exception("Could not find default wallet")

# Get handle for the default wallet
wallet_handle = kmd_client.init_wallet_handle(wallet_id, "")

# Get the first account from the wallet
accounts = kmd_client.list_keys(wallet_handle)
if not accounts:
    raise Exception("No accounts in default wallet")

sandbox_address = accounts[0]
print(f"Using sandbox account: {sandbox_address}")

# Get private key for the sandbox account
sandbox_private_key = kmd_client.export_key(wallet_handle, "", sandbox_address)

# Get suggested parameters
params = algod_client.suggested_params()

# Create a new account for deployment
private_key, address = account.generate_account()
print(f"Created new account: {address}")

# Fund the account from the sandbox's default account
fund_txn = transaction.PaymentTxn(
    sender=sandbox_address,
    sp=params,
    receiver=address,
    amt=1000000,  # 1 ALGO
)

# Sign and submit funding transaction
signed_fund_txn = fund_txn.sign(sandbox_private_key)
fund_txid = algod_client.send_transaction(signed_fund_txn)
print(f"Submitted funding transaction: {fund_txid}")

# Wait for funding transaction to be confirmed
try:
    fund_response = transaction.wait_for_confirmation(algod_client, fund_txid, 4)
    print(f"Funding transaction confirmed in round {fund_response['confirmed-round']}")
except Exception as e:
    print(f"Error funding account: {e}")
    exit(1)

# Compile the programs
approval_result = algod_client.compile(approval_program)
approval_program_bytes = base64.b64decode(approval_result["result"])

clear_result = algod_client.compile(clear_program)
clear_program_bytes = base64.b64decode(clear_result["result"])

print("Programs compiled successfully")

# Create the application
app_args = []
on_complete = transaction.OnComplete.NoOpOC.real
global_schema = transaction.StateSchema(num_uints=2, num_byte_slices=1)
local_schema = transaction.StateSchema(num_uints=0, num_byte_slices=0)

# Create the application creation transaction
create_txn = transaction.ApplicationCreateTxn(
    address,
    params,
    on_complete,
    approval_program_bytes,
    clear_program_bytes,
    global_schema,
    local_schema,
    app_args,
)

# Sign and submit the transaction
signed_txn = create_txn.sign(private_key)
tx_id = algod_client.send_transaction(signed_txn)
print(f"Submitted transaction {tx_id}")

# Wait for confirmation
try:
    transaction_response = transaction.wait_for_confirmation(algod_client, tx_id, 4)
    print(f"Transaction confirmed in round {transaction_response['confirmed-round']}")
    app_id = transaction_response["application-index"]
    print(f"Created new app-id: {app_id}")
except Exception as e:
    print(f"Error: {e}")

# Release wallet handle
kmd_client.release_wallet_handle(wallet_handle) 
