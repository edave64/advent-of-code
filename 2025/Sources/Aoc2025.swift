/// A description

import ArgumentParser
import Benchmark
import Foundation

@main
struct Aoc2025: ParsableCommand {
  @Argument(help: "The day")
  public var day: Int8

  @Argument(help: "Part A or B")
  public var part: String = "both"

  @Flag(name: .shortAndLong, help: "Run multiple times and print times")
  public var benchmark = false

  @Flag(help: "Read input from stdin")
  public var stdin = false

  @Flag(name: .shortAndLong, help: "Use sample input")
  public var sample = false

  public mutating func run() throws {
    let solution = getSolution()

    part = part.lowercased()
    if part != "a" && part != "b" && part != "both" {
      throw RunnerError.invalidPart
    }

    var inputString = ""

    if stdin {
      // Read all of input until EOF
      while let line = readLine() {
        inputString += line + "\n"
      }
    } else {
      let fileName = "\(try seekDataFolder())/\(sample ? "sample" : "input")\(day).txt"
      inputString = try String(contentsOfFile: fileName)
    }

    if benchmark {
      if part == "a" || part == "both" {
        Benchmark.benchmark("Part A") {
          let _ = try solution.partA(input: inputString)
        }
      }
      if part == "b" || part == "both" {
        Benchmark.benchmark("Part B") {
          let _ = try solution.partB(input: inputString)
        }
      }
      Benchmark.main(settings: [TimeUnit(.ms)])
      return
    }

    if part == "a" || part == "both" {
      print(try solution.partA(input: inputString))
    }
    if part == "b" || part == "both" {
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
    case 5:
      return Solution5()
    case 6:
      return Solution6()
    case 7:
      return Solution7()
    default:
      fatalError("Day \(day) not implemented")
    }
  }

  func seekDataFolder() throws -> String {
    let fileManager = FileManager.default
    var currentFolder = URL(string: fileManager.currentDirectoryPath)!

    while !fileManager.fileExists(atPath: "\(currentFolder)/Data") {
      currentFolder.deleteLastPathComponent()

      if currentFolder.pathComponents.count == 1 {
        throw RunnerError.noDataFolder
      }
    }

    return "\(currentFolder.absoluteString)/Data"
  }

  enum RunnerError: Error {
    case invalidPart
    case noDataFolder
  }
}

protocol Solution {
  func partA(input: String) throws -> String
  func partB(input: String) throws -> String
}
