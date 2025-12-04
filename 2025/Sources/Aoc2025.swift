/// A description

import ArgumentParser
import Benchmark

@main
struct Aoc2025: ParsableCommand {
  @Argument(help: "The day")
  public var day: Int8

  @Argument(help: "Part A or B")
  public var part: String

  @Flag(name: .shortAndLong, help: "Run multiple times and print times")
  public var benchmark = false

  public func run() throws {
    let solution = getSolution()

    // Read all of input until EOF
    var inputString = ""

    while let line = readLine() {
        inputString += line + "\n"
    }

    if benchmark {
      Benchmark.benchmark("Test A") {
        print(try solution.partA(input: inputString))
      }
      Benchmark.benchmark("Test B") {
        print(try solution.partB(input: inputString))
      }
      Benchmark.main(settings: [TimeUnit(.ms)])
      return
    }

    if part == "a" {
      print(try solution.partA(input: inputString))
    } else {
      print(try solution.partB(input: inputString))
    }
  }

  func getSolution() -> Solution {
    switch day {
    case 1:
      return Solution1()
    case 2:
      return Solution2()
    case 3:
      return Solution3()
    case 4:
      return Solution4()
    default:
      fatalError("Day \(day) not implemented")
    }
  }
}

protocol Solution {
  func partA(input: String) throws -> String
  func partB(input: String) throws -> String
}
