import kotlin.random.Random
import kotlin.random.nextInt

class Bird (energy: Int = 10,
            weight: Int = 3,
            currentAge: Int = 1,
            maxAge: Int = 10,
            name: String = "bird")
    : Animal(
    energy,
    weight,
    currentAge,
    maxAge,
    name) {


    override fun walk() {
        if (energy <= 5 || weight <= 1) {
            return
        } else {
            energy -= 5
            weight -= 1
            tryIncrementAge()
            println("$name летит")
        }
    }

    override fun birthNewAnimal(): Bird {

        val newBird = Bird(
            energy = Random.nextInt(1..10),
            weight = Random.nextInt(1..5),
            currentAge = 1,
            maxAge,
            name
        )
        newBird.stats()
        println("Родилась ${newBird.name}")
        return newBird
    }
}