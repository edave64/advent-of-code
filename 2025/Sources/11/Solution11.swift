import Foundation

// Cable tangle https://adventofcode.com/2025/day/11
struct Solution11: Solution {
  // The input contains multiple lines, each describing a device and what that device's outputs are connected to.
  // One node is labeled as "you", another one as "out". Find all paths from "you" to "out".
  func partA(input: String) throws -> String {
    var cache: [Int: Int] = [:]
    let (nameLookups, outputsTo) = try readInput(input: input)

    return String(searchPathsToOut(from: nameLookups["you"]!))

    func searchPathsToOut(from: Int) -> Int {
      // Out is always 0, so this is a successful path
      if from == 0 {
        return 1
      }
      if let cached = cache[from] {
        return cached
      }
      var ret = 0
      for output in outputsTo[from] {
        ret += searchPathsToOut(from: output)
      }
      cache[from] = ret
      return ret
    }
  }

  func partB(input: String) throws -> String {
    let (nameLookups, outputsTo) = try readInput(input: input)

    let fft = nameLookups["fft"]!
    let dac = nameLookups["dac"]!
    let svr = nameLookups["svr"]!

    // We need to determine if FFT or DAC come first in the path.
    // FFT can only have connections to DAC or vice versa. They can't both be connected to each
    // other, otherwise we have a cycle.
    // In my input, I know FFT comes first, so I wrote this code to be most efficient in that case.
    // But it can also handle the other case.
    var first = fft
    var second = dac
    var cache: [Int: Int] = [:]
    var firstToSecond = searchPaths(from: first, to: second, cache: &cache)

    if firstToSecond == 0 {
      // This is the case where DAC comes first
      first = dac
      second = fft
      cache = [:]
      firstToSecond = searchPaths(from: first, to: second, cache: &cache)
    }

    if firstToSecond == 0 { throw SolutionError.noSolution }

    cache = [:]
    let srvToFirst = searchPaths(from: svr, to: first, cache: &cache)

    cache = [:]
    let secondToOut = searchPaths(from: second, to: 0, cache: &cache)

    if srvToFirst == 0 || secondToOut == 0 { throw SolutionError.noSolution }

    return String(srvToFirst * firstToSecond * secondToOut)

    func searchPaths(from: Int, to: Int, cache: inout [Int: Int]) -> Int {
      if from == to {
        return 1
      }
      if let cached = cache[from] {
        return cached
      }
      var ret = 0
      for output in outputsTo[from] {
        ret += searchPaths(from: output, to: to, cache: &cache)
      }
      cache[from] = ret
      return ret
    }
  }

  func readInput(input: String) throws -> (nameLookups: [String: Int], outputsTo: [[Int]]) {
    // Translate all device names to indices that can be used to efficiently address a device and it's data
    var nameLookups: [String: Int] = ["out": 0]
    // Outputs for each device. Device 0, "out", has no outputs.
    var outputsTo: [[Int]] = [[]]

    for line in input.split(separator: "\n") {
      let parts = line.split(separator: ":")
      if parts.count != 2 {
        throw SolutionError.invalidInput
      }

      let deviceName = parts[0]
      let deviceId = getId(name: deviceName)
      let outputs = parts[1].split(separator: " ").map(getId)

      outputsTo[deviceId] = outputs
    }

    return (nameLookups, outputsTo)

    func getId(name: Substring.SubSequence) -> Int {
      let name = name.trimmingCharacters(in: CharacterSet.whitespaces)
      if let id = nameLookups[name] {
        return id
      }
      let id = outputsTo.count
      nameLookups[name] = id
      outputsTo.append([])
      return id
    }
  }

  enum SolutionError: Error {
    case invalidInput
    case noSolution
  }
}
