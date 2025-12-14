// Factory blinkenlights https://adventofcode.com/2025/day/10

import Cassowary

import Foundation

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

    var loader = Aoc2025()

    let precalc = loader.fetchDataFile(file: "solve10.txt")!.split(separator: "\n").map({
      $0.split(separator: " ").map({ Int($0)! })
    })
    var lineI = 0

    for line in input.split(separator: "\n") {
      var (_, buttons, targetJoltages) = try parseLine(line: line)

      // First, we find numbers that can only be incremented by one button
      /*var onlyIdxs = Array(repeating: -1, count: targetJoltages.count)
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

      buttons.sort { $1.count < $0.count }*/

      buttons.sort { $1.count < $0.count }

      sum += try partBCassowary(
        buttons: buttons, targetJoltages: targetJoltages, testing: precalc[lineI])
      lineI += 1
    }
    return String(sum)
  }

  func partBCassowary(buttons: [[Int]], targetJoltages: [Int], testing: [Int]? = nil)
    throws -> Int
  {
    let solver = Solver()

    let vars = buttons.enumerated().map({ Variable("var_\($0.offset)") })

    var errors: [String] = []

    for v in vars {
      try solver.add(constraint: v >= 0)
    }

    for v in (0..<vars.count - 1) {
      try solver.add(constraint: vars[v] >= vars[v + 1], strength: Strength.strong)
    }

    for (i, targetJoltage) in targetJoltages.enumerated() {
      if targetJoltage == 0 { continue }
      let buttonsWithEffect = buttons.enumerated().filter({ $0.element.contains(i) }).map({
        $0.offset
      })

      do {
        if buttonsWithEffect.count == 0 {
          continue
        } else if buttonsWithEffect.count == 1 {
          try solver.add(constraint: vars[buttonsWithEffect[0]] == Double(targetJoltage))
        } else {
          var exp = vars[buttonsWithEffect[0]] + vars[buttonsWithEffect[1]]
          for btn in buttonsWithEffect.dropFirst(2) {
            exp = exp + vars[btn]
          }
          try solver.add(
            constraint: Double(targetJoltage) == exp
          )
        }
      } catch is DuplicateConstraint {
        errors.append(
          "UnsatisfiableConstraint \(targetJoltage) = \(buttonsWithEffect.map({ vars[$0].name }))")
      } catch is UnsatisfiableConstraint {
        errors.append(
          "UnsatisfiableConstraint \(targetJoltage) = \(buttonsWithEffect.map({ vars[$0].name }))")
      }
    }
    solver.update()

    var optimizeExp = 0.0 + vars.first!

    for v in vars.dropFirst() {
      optimizeExp = optimizeExp + v
    }

    var lastValidVars: [Int]?

    if validVars() {
      lastValidVars = vars.map({ Int(round($0.value)) })
    } else {
      //print("Invalid", vars.map({ $0.value }))
    }

    while true {
      do {
        try solver.add(constraint: optimizeExp <= vars.reduce(0, { $0 + $1.value }) - 1)
        solver.update()

        if validVars() {
          lastValidVars = vars.map({ Int(round($0.value)) })
        }
      } catch {
        break
      }
    }

    func validVars() -> Bool {
      let varStates = vars.map({ Int(round($0.value)) })
      var res = Array(repeating: 0, count: targetJoltages.count)

      for (btnIdx, btnPresses) in varStates.enumerated() {
        for slot in buttons[btnIdx] {
          res[slot] += btnPresses
        }
      }

      return res == targetJoltages
    }

    if lastValidVars == nil {
      errors.append("No valid solution found")
    }

    let res = lastValidVars ?? vars.map({ Int(round($0.value)) })
    let ret = res.reduce(0, +)

    if testing != nil && testing!.reduce(0, +) != ret {
      errors.append("Testing failed: \(res), expected \(testing!)")

      print("")
      print("Failed in \(buttons) -> \(targetJoltages)")
      for e in errors {
        print(e)
      }
    }

    return ret
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
