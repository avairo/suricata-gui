
import json
import time
import random
import os
from datetime import datetime
import sys

# Default path - matches main.py fallback
LOG_PATH = "dummy_eve.json"

# Events to simulate different types of traffic
SIGNATURES = [
    {"msg": "ET MALWARE User-Agent (Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1))", "severity": 1, "category": "Malware Command and Control"},
    {"msg": "ET SCAN Nmap Scripting Engine User-Agent", "severity": 2, "category": "Web Application Attack"},
    {"msg": "SURICATA STREAM ESTABLISHED packet out of window", "severity": 3, "category": "Stream Error"},
    {"msg": "ET POLICY GNU/Linux APT User-Agent Outbound", "severity": 3, "category": "Policy Violation"},
    {"msg": "ET TROJAN AIBATTOO.A Checkin", "severity": 1, "category": "Trojan Activity"},
]

def generate_alert():
    sig = random.choice(SIGNATURES)
    
    event = {
        "timestamp": datetime.utcnow().isoformat() + "+0000",
        "flow_id": random.randint(1000000000000000, 9999999999999999),
        "in_iface": "eth0",
        "event_type": "alert",
        "src_ip": f"{random.randint(8, 100)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}",
        "src_port": random.randint(1024, 65535),
        "dest_ip": f"{random.randint(8, 100)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}",
        "dest_port": 80,
        "proto": "TCP",
        "alert": {
            "action": "allowed",
            "gid": 1,
            "signature_id": random.randint(2000000, 3000000),
            "rev": 1,
            "signature": sig["msg"],
            "category": sig["category"],
            "severity": sig["severity"]
        }
    }
    return event

def main():
    print(f"Starting alert generator...")
    print(f"Writing to: {os.path.abspath(LOG_PATH)}")
    print("Press Ctrl+C to stop.")

    try:
        while True:
            alert = generate_alert()
            
            with open(LOG_PATH, "a") as f:
                json.dump(alert, f)
                f.write("\n")
            
            print(f"Generated alert: {alert['alert']['signature']}")
            
            # Random delay between 1 and 5 seconds
            time.sleep(random.uniform(1, 5))
            
    except KeyboardInterrupt:
        print("\nStopped.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        LOG_PATH = sys.argv[1]
    main()
