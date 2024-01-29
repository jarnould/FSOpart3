const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://juarnould:${password}@cluster0.a17ichz.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length===3) {
    Person.find({})
    .then(persons => {
        persons.forEach(person => 
            console.log(person.name + ' ' + person.number)
            )
        mongoose.connection.close()
    })
}

else {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })
    
    person.save()
    .then(() => {
        console.log(`added ${process.argv[3]} ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}


