import kotlin.random.Random
import kotlin.random.nextInt

open class Animal(
    var energy: Int = 10,
    var weight: Int = 5,
    var currentAge: Int = 1,
    var maxAge: Int = 10,
    var name: String = "Просто животное"
) {

    fun isTooOld(): Boolean {
        if (currentAge >= maxAge){
            println("$name умирает")
            return true
        } else return false
    }


    fun sleep() {
        if (isTooOld()) {
            return
        } else {
            energy += 5
            currentAge += 1
            println("$name спит.")
        }
    }

    open fun tryIncrementAge() {
        if (Random.nextBoolean()) {
            currentAge += 1
        }
    }

    fun eat() {
        if (isTooOld()) {
            return
        } else {
            energy += 3
            weight += 1
            tryIncrementAge()
            println("$name ест")
        }
    }

    open fun walk() {
        if (energy <= 5 || weight <= 1) {
            return
        } else {
            energy -= 5
            weight -= 1
            tryIncrementAge()
            println("$name идёт")
        }
    }

    open fun birthNewAnimal(): Animal {
        val newAnimalChild = Animal(
            energy = Random.nextInt(1..10),
            weight = Random.nextInt(1..5),
            currentAge = 1,
            maxAge = maxAge,
            name = name
        )
        println("Родилось новое животное")
        newAnimalChild.stats()
        return newAnimalChild
    }



    open fun stats(){
        println("Current energy = $energy")
        println("Current weight = $weight")
        println("Current age = $currentAge")
        println("Name is $name")
    }
}