
const { Client } = require('pg');

const connectionString = `postgresql://karma_techa_owner:${process.env.DB_PASSWORD}@${process.env.DB_URL}/karma_techa?sslmode=require`;

const createClient = () => {
  return new Client({
    connectionString,
  });
};

export const queryDatabase = async (queryText: string, params = []) => {
  const client = createClient();
  try {
    await client.connect();
    console.log('Connected to the database');
    const res = await client.query(queryText, params);
    return res.rows;
  } catch (err) {
    console.error('Error querying the database:', err);
    throw err;
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

export const updateDatabase = async (queryText: string, params = []) => {
  const client = createClient();
  try {
    await client.connect();
    console.log('Connected to the database');
    const res = await client.query(queryText, params);
    return res.rowCount;
  } catch (err) {
    console.error('Error updating the database:', err);
    throw err;
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}
