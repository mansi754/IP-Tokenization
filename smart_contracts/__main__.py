import sys
import os
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

@dataclass
class Contract:
    name: str
    path: Path

def get_contracts() -> list[Contract]:
    contracts_dir = Path(__file__).parent
    return [
        Contract(
            name=contract_dir.name,
            path=contract_dir / "contract.py",
        )
        for contract_dir in contracts_dir.iterdir()
        if contract_dir.is_dir() and not contract_dir.name.startswith("__")
    ]

def build(output_dir: Path, contract_path: Path) -> None:
    import importlib.util

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Import the contract module
    spec = importlib.util.spec_from_file_location("contract", contract_path)
    if not spec or not spec.loader:
        raise Exception(f"Could not load contract from {contract_path}")

    contract_module = importlib.util.module_from_spec(spec)
    if not contract_module:
        raise Exception(f"Could not create module from {contract_path}")

    sys.modules["contract"] = contract_module
    spec.loader.exec_module(contract_module)

    # Get the contract class (assuming it's the first class defined in the module)
    contract_class = None
    for attr in dir(contract_module):
        if attr.startswith("__"):
            continue
        value = getattr(contract_module, attr)
        if isinstance(value, type):
            contract_class = value
            break

    if not contract_class:
        raise Exception(f"No contract class found in {contract_path}")

    # Create an instance of the contract
    contract = contract_class()

    # Compile the contract
    try:
        approval, clear, contract_json = contract.dump(str(output_dir))
        print(f"Contract built successfully!")
        print(f"Approval program: {approval}")
        print(f"Clear program: {clear}")
        print(f"Contract: {contract_json}")
    except Exception as e:
        raise Exception(f"Could not build contract: {e}")

def main(command: str) -> None:
    contracts = get_contracts()

    if command == "build":
        artifact_path = Path(__file__).parent / "artifacts"
        for contract in contracts:
            print(f"Building {contract.name}...")
            build(artifact_path / contract.name, contract.path)
    elif command == "deploy":
        print("Deployment not implemented yet")
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m smart_contracts [build|deploy]")
        sys.exit(1)

    main(sys.argv[1])
