import psycopg2
import psycopg2.extras
import os
import uuid
import json
from contextlib import contextmanager
from app.core.config import DATABASE_URL

@contextmanager
def get_db_connection():
    conn = None
    try:
        psycopg2.extras.register_uuid()
        conn = psycopg2.connect(DATABASE_URL)
        # Set autocommit to False for regular operations
        conn.autocommit = False 
        yield conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise
    finally:
        if conn:
            conn.close()

@contextmanager
def get_db_cursor(commit=False):
    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False # Ensure transactions are handled explicitly
        psycopg2.extras.register_uuid()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        print(f"Database cursor error: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def check_table_exists(table_name: str) -> bool:
    """Checks if a table exists in the database."""
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s);",
                (table_name,)
            )
            return cursor.fetchone()[0]
    except Exception as e:
        print(f"Error checking if table 	{table_name}	 exists: {e}")
        return False

def initialize_database():
    """Attempts to create the necessary tables if they don't exist."""
    conn = None
    try:
        # Connect with autocommit specifically for table creation
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        psycopg2.extras.register_uuid()
        print("Database connection successful for initialization.")
        
        with conn.cursor() as cursor:
            # Check if table exists
            try:
                cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hands');")
                exists = cursor.fetchone()[0]
            except Exception as e:
                print(f"Error checking if table exists during init: {e}")
                exists = False # Assume it doesn't exist if check fails
            
            if not exists:
                print("Hands table does not exist. Attempting to create...")
                # Try the simplified table creation directly
                try:
                    cursor.execute("""
                    CREATE TABLE hands (
                        id TEXT PRIMARY KEY,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        stack_settings TEXT,
                        player_roles TEXT,
                        hole_cards TEXT,
                        action_sequence TEXT,
                        winnings TEXT
                    );
                    """)
                    print("Created simplified hands table with TEXT fields.")
                except psycopg2.Error as e:
                    # Check for permission denied error specifically
                    if "permission denied" in str(e).lower():
                        print("****************************************************************")
                        print("ERROR: Database user lacks permission to create tables.")
                        print("Please create the 'hands' table manually using a privileged user.")
                        print("See the project documentation or summary for the SQL command.")
                        print("****************************************************************")
                    else:
                        print(f"Critical error creating table: {e}")
                    # Indicate that the table might still be missing
                    print("The application will continue but database operations might fail if the table is missing.")
                except Exception as e:
                    print(f"Unexpected critical error creating table: {e}")
            else:
                print("Hands table already exists.")
    except Exception as e:
        print(f"Error during database initialization: {e}")
        print("The application will continue but database operations may fail.")
    finally:
        if conn:
            conn.close()
