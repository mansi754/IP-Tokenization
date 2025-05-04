from smart_contracts.ip_tokens.contract import IPTokenizationPlatform
import os

def main():
    # Create artifacts directory if it doesn't exist
    if not os.path.exists("artifacts"):
        os.makedirs("artifacts")

    # Create an instance of the contract
    app = IPTokenizationPlatform()

    # Compile the contract
    approval, clear, contract = app.dump("artifacts")

    print(f"Contract compiled successfully!")
    print(f"Approval program: {approval}")
    print(f"Clear program: {clear}")
    print(f"Contract: {contract}")

if __name__ == "__main__":
    main()
