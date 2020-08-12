const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const knex = require('knex');

const db = knex({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'digipro'
    }
});

const getData = () => {
    // Write Headers
    const writeStream = fs.createWriteStream(`Invoice.csv`);
    writeStream.write(`No_Invoice, MT_100_Name, Date, Amount \n`);

    // Write Body
    db.select('*')
    .from('trx_invoice')
    .innerJoin('trx_invoice_mt_100_ref', 'trx_invoice.mt_100_id', 'trx_invoice_mt_100_ref.id')
    .then((invoices) => {
        
        for(let i = 0; i < invoices.length; i++){
            const invoice_number = invoices[i].invoice_number;
            const mt_100_name = invoices[i].mt_100_name;
            const payment_schedule = invoices[i].payment_schedule;
            const invoice_amount = invoices[i].invoice_amount;
            const day = (new Date(payment_schedule)).getDate();
            const month = (new Date(payment_schedule)).getMonth()+1;
            const year = (new Date(payment_schedule)).getFullYear();
            if(year >= 2020){
                let date;
                if(day < 10 && month < 10){
                    date = `0${day}/0${month}/${year}`;
                }else if(day < 10){
                    date = `0${day}/${month}/${year}`;
                }else if(month < 10){
                    date = `${day}/0${month}/${year}`;
                }else{
                    date = `${day}/${month}/${year}`;
                }
                
                writeStream.write(`${invoice_number}, ${mt_100_name}, ${date}, ${invoice_amount} \n`);
            }
            
        }
        
    })

}

getData()
