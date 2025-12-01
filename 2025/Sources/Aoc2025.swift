/// A description

import ArgumentParser

@main
struct Aoc2025: ParsableCommand {
  @Argument(help: "The day")
  public var day: Int8

  @Argument(help: "Part A or B")
  public var part: String

  @Flag(name: .shortAndLong, help: "Run multiple times and print times")
  public var benchmark = false

  public func run() throws {
    var solution = getSolution()

    // Read all of input until EOF
    var inputString = ""

    while let line = readLine() {
        inputString += line + "\n"
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
    default:
      fatalError("Day \(day) not implemented")
    }
  }
}

protocol Solution {
  func partA(input: String) throws -> String
  func partB(input: String) throws -> String
}
