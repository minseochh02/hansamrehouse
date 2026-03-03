import { executeSQL } from './egdesk-helpers';

async function checkData() {
  try {
    console.log('--- MasterCategories ---');
    const cats = await executeSQL('SELECT * FROM MasterCategories LIMIT 1');
    console.log(JSON.stringify(cats.rows, null, 2));

    console.log('\n--- MasterSubCategories ---');
    const subCats = await executeSQL('SELECT * FROM MasterSubCategories LIMIT 1');
    console.log(JSON.stringify(subCats.rows, null, 2));

    console.log('\n--- MasterItems ---');
    const items = await executeSQL('SELECT * FROM MasterItems LIMIT 1');
    console.log(JSON.stringify(items.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkData();
