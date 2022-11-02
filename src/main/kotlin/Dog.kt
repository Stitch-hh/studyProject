import kotlin.random.Random
import kotlin.random.nextInt

class Dog (energy: Int = 12,
           weight: Int = 4,
           currentAge: Int = 1,
           maxAge: Int = 15,
           name: String = "dog")
    : Animal(
    energy,
    weight,
    currentAge,
    maxAge,
    name){


    override fun walk () {
        if (energy <= 5 || weight <= 1) {return}
        else {
            energy -= 5
            weight -= 1
            tryIncrementAge()
            println("$name бежит")}
    }

    override fun birthNewAnimal(): Dog {

        val newDog =  Dog(
            energy = Random.nextInt(1..10),
            weight = Random.nextInt(1..5),
            currentAge = 1,
            maxAge,
            name
        )
        newDog.stats()
        println("Родилась ${newDog.name}")
        return newDog
    }
}