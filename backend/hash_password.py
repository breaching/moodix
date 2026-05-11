import bcrypt
import sys

if len(sys.argv) < 2:
    print("Usage: python hash_password.py your_password")
    sys.exit(1)

password = sys.argv[1]
# Generate bcrypt hash with salt (secure industry standard)
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

print("\n" + "="*60)
print("Password Hash Generator (bcrypt)")
print("="*60)
print(f"\nPassword: {password}")
print(f"Hash: {password_hash}")
print("\nAdd this to your .env file:")
print(f"APP_PASSWORD_HASH={password_hash}")
print("\nNote: bcrypt includes salt automatically - each run produces")
print("a different hash, but all are valid for the same password.")
print("="*60 + "\n")
