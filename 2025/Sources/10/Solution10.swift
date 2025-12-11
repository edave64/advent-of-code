import Foundation

// Factory blinkenlights https://adventofcode.com/2025/day/10
struct Solution10: Solution {
  static let max = Int.max - 1

  /// The input contains a configuration of lamps, a number of buttons that flip these lamps, and
  /// a part we can ignore for now.
  /// For each line in the input, we must find the least amount of buttons that we need to press
  /// to get the lamps to the desired state.
  /// They all start being turned off.
  /// Basically, we're playing Lights Out.
  func partA(input: String) throws -> String {
    var sum = 0
    for line in input.split(separator: "\n") {
      let (targetLights, buttons, _) = try parseLine(line: line)
      let ret = shortestSwitching(currentLights: targetLights, buttons: buttons.map(buttonsToBits))
      if ret == Solution10.max {
        throw SolutionError.noSolution
      }
      sum += ret
    }
    return String(sum)
  }

  /// Returns the minimum amount of buttons needed to get the lamps to the desired state.
  /// Basically a depth-first recursive search.
  /// Even though the puzzle allows us to press a switch multiple times, doing so would just be
  /// the same as not pressing it at all, since pressing a switch is essentially just an XOR.
  /// So we only press any switch once, and recursive calls exclude the buttons that parent calls
  /// have already passed.
  func shortestSwitching(currentLights: Int, buttons: [Int], start: Int = 0)
    -> Int
  {
    var shortest = Solution10.max
    for i in start..<buttons.count {
      let btn = buttons[i]
      let newLights = currentLights ^ btn
      if newLights == 0 {
        return 1
      }
      let rec =
        shortestSwitching(
          currentLights: newLights, buttons: buttons, start: i + 1) + 1
      if rec < shortest {
        shortest = rec
      }
    }

    return shortest
  }

  func partB(input: String) throws -> String {
    var sum = 0

    for line in input.split(separator: "\n") {
      var (_, buttons, targetJoltages) = try parseLine(line: line)

      var forcedPresses = 0

      print("Solving for line \(line)")

      // First, we find numbers that can only be incremented by one button
      var onlyIdxs = Array(repeating: -1, count: targetJoltages.count)
      for (i, button) in buttons.enumerated() {
        for j in button {
          if onlyIdxs[j] == -1 {
            onlyIdxs[j] = i
          } else {
            onlyIdxs[j] = -2
          }
        }
      }

      for (i, onlyIdx) in onlyIdxs.enumerated() {
        if onlyIdx == -1 {
          if targetJoltages[i] > 0 {
            // Place cannot be incremented
            throw SolutionError.noSolution
          }
        } else if onlyIdx != -2 {
          // Only button `onlyIdx` can increment the number in position `i`
          let forced = targetJoltages[i]
          for n in buttons[onlyIdx] {
            targetJoltages[n] -= forced
          }
          forcedPresses += forced
        }
      }

      let removebuttons = Set(onlyIdxs.filter({ $0 >= 0 })).sorted(by: { $1 < $0 })
      for sIdx in removebuttons {
        buttons.remove(at: sIdx)
        print("In \(line), removing switch \(sIdx), \(targetJoltages)")
      }

      buttons.sort { $1.count < $0.count }

      let ret = partBSwitchingOneShot(
        currentJoltages: targetJoltages, buttons: buttons)
      if ret == Solution10.max {
        throw SolutionError.noSolution
      }
      print("Solved for line \(line), \(ret) presses needed")
      sum += ret + forcedPresses
    }
    return String(sum)
  }

  func partBSwitching(
    currentJoltages: [Int], buttons: [[Int]], pressesLeft: Int, start: Int = 0
  ) -> Int {
    if pressesLeft == 0 { return pressesLeft }
    var minPresses = pressesLeft
    for i in start..<buttons.count {
      let button: [Int] = buttons[i]
      let maxPresses = min(button.map({ currentJoltages[$0] }).min()!, pressesLeft)

      for presses in stride(from: maxPresses, through: 0, by: -1) {
        var newJoltages = currentJoltages
        let remainingPresses = minPresses - presses
        if remainingPresses < 0 { continue }
        for j in button {
          newJoltages[j] -= presses
        }

        if newJoltages.allSatisfy({ $0 == 0 }) {
          return presses
        }

        let newShortest = partBSwitching(
          currentJoltages: newJoltages, buttons: buttons,
          pressesLeft: remainingPresses, start: i + 1
        )

        if newShortest + presses < minPresses {
          minPresses = newShortest + presses
        }
      }
    }

    return minPresses
  }

  func partBSwitchingOneShot(
    currentJoltages: [Int], buttons: [[Int]], start: Int = 0
  ) -> Int {
    for i in start..<buttons.count {
      let button: [Int] = buttons[i]
      let maxPresses = button.map({ currentJoltages[$0] }).min()!

      for presses in stride(from: maxPresses, through: 0, by: -1) {
        var newJoltages = currentJoltages
        for j in button {
          newJoltages[j] -= presses
        }

        if newJoltages.allSatisfy({ $0 == 0 }) {
          return presses
        }

        let ret = partBSwitchingOneShot(
          currentJoltages: newJoltages, buttons: buttons, start: i + 1
        )

        if ret < Solution10.max {
          return ret + presses
        }
      }
    }

    return Solution10.max
  }

  static private let lightOn = "#".utf8.first!

  /// Input [.#.] (1,2) (2,3) (3,0) {1,2,3}
  ///       ^---^ Target light config for part A
  ///             ^---------------^ buttons
  ///                               ^-----^ Target joltage config for part B
  func parseLine(line: String.SubSequence) throws -> (Int, [[Int]], [Int]) {
    let components = line.split(separator: " ")
    // Since targetLights is just a sequence of true/false values, we turn it into a bitfield
    var targetLights = 0
    var buttons = [[Int]]()
    var targetJoltages = [Int]()

    for component in components {
      if component.hasPrefix("[") {
        // The addressing of the lights is left to right, so we need to reverse the order for the
        // number conversion
        for symbol in component.utf8.dropFirst().dropLast().reversed() {
          targetLights <<= 1
          targetLights |= (symbol == Self.lightOn ? 1 : 0)
        }
      } else if component.hasPrefix("(") {
        let nums = component.dropFirst().dropLast().split(separator: ",")
        buttons.append(nums.map({ Int($0)! }))
      } else if component.hasPrefix("{") {
        targetJoltages = component.dropFirst().dropLast().split(separator: ",").map({
          Int(String($0))!
        })
      } else {
        throw SolutionError.invalidInput
      }
    }

    return (targetLights, buttons, targetJoltages)
  }

  func buttonsToBits(buttons: [Int]) -> Int {
    var bits = 0
    for button in buttons {
      bits |= 1 << button
    }
    return bits
  }

  enum SolutionError: Error {
    case invalidInput
    case noSolution
  }
}
