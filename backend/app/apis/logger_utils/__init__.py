
import sqlite3
import time
from typing import Optional, Dict, Any
import os
import json

# --- Configuration ---
DATABASE_DIR = "/app/src/app/database"
DATABASE_NAME = "phantom_shield_logs.db"
DATABASE_PATH = os.path.join(DATABASE_DIR, DATABASE_NAME)

# Ensure the database directory exists
try:
    os.makedirs(DATABASE_DIR, exist_ok=True)
    print(f"Ensured database directory exists: {DATABASE_DIR}")
except OSError as e:
    print(f"Warning: Could not create database directory {DATABASE_DIR}: {e}. Assuming it exists or will be created by another process.")

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Critical SQLite error connecting to database at {DATABASE_PATH}: {e}")
        raise

def init_db():
    """
    Initializes the database and creates the logs table if it doesn't exist.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            log_hash TEXT, -- Primary identifier, hash of IP+UA+other factors
            event TEXT NOT NULL,
            reason TEXT,
            score REAL,
            -- ip_address TEXT, -- Removed for PII compliance
            -- user_agent TEXT, -- Removed for PII compliance
            campaign_id INTEGER,
            fingerprint_hash TEXT, -- Can be same as log_hash or a more specific client fingerprint
            ml_score REAL,
            additional_data TEXT 
        )
        """)
        conn.commit()
        print(f"Database initialized successfully at {DATABASE_PATH}. 'logs' table ensured.")
    except sqlite3.Error as e:
        print(f"SQLite error during DB initialization: {e}")
    finally:
        if conn:
            conn.close()

def add_log_entry(
    event: str,
    log_hash: Optional[str] = None, # This should be the primary hash identifier
    reason: Optional[str] = None,
    score: Optional[float] = None,
    # ip_address: Optional[str] = None, # Removed for PII compliance
    # user_agent: Optional[str] = None, # Removed for PII compliance
    campaign_id: Optional[int] = None,
    fingerprint_hash: Optional[str] = None, # Can be the client-generated fingerprint hash
    ml_score: Optional[float] = None,
    additional_data: Optional[Dict[str, Any]] = None
) -> Optional[int]:
    """
    Adds a new log entry to the SQLite database.
    Returns the ID of the newly inserted row, or None if an error occurs.
    """
    timestamp = int(time.time())
    additional_data_json = json.dumps(additional_data) if additional_data is not None else None
    
    sql = """INSERT INTO logs (
                timestamp, log_hash, event, reason, score, 
                campaign_id, fingerprint_hash, ml_score, additional_data
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"""
    
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(sql, (timestamp, log_hash, event, reason, score, 
                              campaign_id, fingerprint_hash, ml_score, additional_data_json))
        conn.commit()
        last_row_id = cursor.lastrowid
        print(f"Log entry added: Event '{event}', ID: {last_row_id}, Hash: {log_hash}, ML Score: {ml_score}")
        return last_row_id
    except sqlite3.Error as e:
        print(f"SQLite error adding log entry for event '{event}': {e}")
        return None
    finally:
        if conn:
            conn.close()

# --- Initial DB Setup Call ---
try:
    print("logger_utils module imported, initializing database...")
    init_db()
except Exception as e:
    print(f"CRITICAL ERROR during initial database setup in logger_utils: {e}")
    print("The application might not be able to log events correctly.")

# if __name__ == "__main__": (COMMENTED OUT)
#     print("Running logger_utils.py directly for testing and DB initialization check.")
    # Example usage:
    # test_log_id = add_log_entry(
    #     event="test_event_direct_run", 
    #     log_hash="direct_run_hash_456", 
    #     reason="Module direct run test from __main__", 
    #     ml_score=0.88,
    #     fingerprint_hash="fp_direct_xyz",
    #     additional_data={"test_key": "test_value"},
    #     ip_address="127.0.0.1"
    # )
    # if test_log_id:
    #     print(f"Test log entry added with ID: {test_log_id}")
    # else:
    #     print("Failed to add test log entry.")

from fastapi import APIRouter

router = APIRouter()



def clear_old_logs(days_to_keep: int = 30) -> tuple[bool, str]:
    """
    Deletes log entries older than a specified number of days from the SQLite database.
    Returns a tuple (success_status, message).
    """
    if not isinstance(days_to_keep, int) or days_to_keep <= 0:
        return False, "Invalid 'days_to_keep', must be a positive integer."

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate the cutoff timestamp
        # SQLite's strftime('%s', 'now', '-X days') returns seconds since epoch
        cutoff_timestamp = int(time.time()) - (days_to_keep * 24 * 60 * 60)
        
        sql_delete = "DELETE FROM logs WHERE timestamp < ?"
        
        print(f"Attempting to delete logs older than {days_to_keep} days (timestamp < {cutoff_timestamp})...")
        cursor.execute(sql_delete, (cutoff_timestamp,))
        conn.commit()
        
        rows_deleted = cursor.rowcount
        message = f"Successfully deleted {rows_deleted} log entries older than {days_to_keep} days."
        print(message)
        return True, message
        
    except sqlite3.Error as e:
        message = f"SQLite error during log cleanup: {e}"
        print(message)
        return False, message
    except Exception as e:
        message = f"An unexpected error occurred during log cleanup: {e}"
        print(message)
        return False, message
    finally:
        if conn:
            conn.close()

# Example of how this clear_old_logs could be exposed via an admin API endpoint (conceptual)
# This would typically be in a separate admin API file, protected.
# from fastapi import Depends # (if you add protection)
# @router.post("/admin/clear-logs", tags=["Admin"], include_in_schema=False) # Add router if not defined
# async def trigger_clear_old_logs(days: int = 30): # , current_user: User = Depends(get_current_admin_user)
#     success, message = clear_old_logs(days_to_keep=days)
#     if success:
#         return {"status": "success", "message": message}
#     else:
#         raise HTTPException(status_code=500, detail=message)


pass # Ensure the file is not completely empty and is valid Python
