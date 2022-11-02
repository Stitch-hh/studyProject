import kotlin.random.Random
import kotlin.random.nextInt

class Fish(
    energy: Int = 5,
    weight: Int = 3,
    currentAge: Int = 1,
    maxAge: Int = 10,
    name: String = "fish")
    : Animal(
    energy,
    weight,
    currentAge,
    maxAge,
    name) {


    override fun walk () {
        if (energy <= 5 || weight <= 1) {return}
        else {
            energy -= 5
            weight -= 1
            tryIncrementAge()
            println("$name плывёт")}
        }

    override fun birthNewAnimal(): Fish {

        val newFish =  Fish(
            energy = Random.nextInt(1..10),
            weight = Random.nextInt(1..5),
            currentAge = 1,
            maxAge,
            name
        )
        newFish.stats()
        println("Родилась ${newFish.name}")
        return newFish
    }
}