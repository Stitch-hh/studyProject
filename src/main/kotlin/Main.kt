import kotlin.random.Random
import kotlin.random.nextInt

fun main() {



    fun startZoo() {
        val numberOfDays = readLine()?.toIntOrNull()
        if (numberOfDays != null) {
            if (numberOfDays <= 0) {
                println("Введите корректное количество дней")
                startZoo()
            } else {
                val zoo = NatureReserve.listOfAnimals
                var today = 0
                println(zoo)
                while (today <= numberOfDays){
                for (i in zoo.indices) {
                    when (Random.nextInt(1..5)) {
                        1 -> zoo[i].sleep()
                        2 -> zoo[i].walk()
                        3 -> zoo[i].eat()
                        4 -> { zoo.add(zoo[i].birthNewAnimal()) }
                    }
                }
                println(zoo)
                    val oldAnimals = ArrayList<Animal>()
                    zoo.filter { it.isTooOld() }.map { oldAnimals.add(it) }
                    zoo.removeAll(oldAnimals)

                println(zoo)
                    println("Наступил новый день")
                today ++
                }
                return
            }
        }
        else println("Введите корректное количество дней")
        startZoo()
    }

    println("Введите количество дней существования зоопарка")
    startZoo()
}