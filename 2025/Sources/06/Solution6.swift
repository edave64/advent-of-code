import Foundation

// Cephalopod math https://adventofcode.com/2025/day/6
// Input is structured as follows:
// - Lines with multiple columns of numbers, separated by spaces
// - Ended by a single line of either "*" or "+"
//
// All numbers in a per column are added or multiplied together, depending on
// the operation in the last line.
struct Solution6: Solution {
  // Add together the results of all operations.
  func partA(input: String) throws -> String {
    // Addition and multiplication are commutative, so the order doesn't matter.
    // And since we need the operations on the last line, we can just reverse the whole thing.
    let lines = input.split(separator: "\n").makeIterator().reversed()
    let ops = lines[0].split(separator: " ", omittingEmptySubsequences: true).map {
      $0 == "*" ? Operation.multiply : Operation.add
    }
    // The current results for each column.
    // We cannot initialize rollingTotals with 0, otherwise multiplication will fail. So we
    // initialize with the first line of numbers.
    var rollingTotals = lines[1].split(separator: " ", omittingEmptySubsequences: true).map {
      Int($0)!
    }

    if rollingTotals.count != ops.count {
      throw SolutionError.invalidInput
    }

    for line in lines.dropFirst(2) {
      let nums = line.split(separator: " ", omittingEmptySubsequences: true).map { Int($0)! }
      for (i, num) in nums.enumerated() {
        switch ops[i] {
        case .add:
          rollingTotals[i] += num
        case .multiply:
          rollingTotals[i] *= num
        }
      }
    }

    // Add all results together.
    return String(rollingTotals.reduce(0, +))
  }

  // Actually, cephalopod numbers are written top to bottom. Also the columns are right to left,
  // but again, that doesn't matter since the operations are commutative.
  func partB(input: String) throws -> String {
    // Order now matters, since we need to read in the numbers from top to bottom.
    // I mean, we could read it reversed, but that would be more effort for no gain.
    let lines = input.split(separator: "\n")
    var colsPerOp = [Int]()
    var ops = [Operation]()

    // We still need to read the ops first, since they will tell us how many columns there are
    let lastLine = lines.last!
    var lengthOfLastOp = 0

    for (i, char) in lastLine.enumerated() {
      if char == "*" || char == "+" {
        ops.append(char == "*" ? Operation.multiply : Operation.add)
        if i != 0 {
          colsPerOp.append(lengthOfLastOp)
        }
        lengthOfLastOp = 0
      } else {
        lengthOfLastOp += 1
      }
    }
    // Add one here since we are counting one short for each column to account for the padding
    // But the last line doesn't have padding.
    colsPerOp.append(lengthOfLastOp + 1)

    var numbers = (0..<colsPerOp.count).map { Array(repeating: 0, count: colsPerOp[$0]) }

    // Read in the numbers
    for var line in lines.dropLast() {
      for (i, cols) in colsPerOp.enumerated() {
        let slice = line.prefix(cols)
        // Also drop one char of padding
        line = line.dropFirst(cols + 1)
        var nums = numbers[i]

        for (i, char) in slice.enumerated() {
          if char.isNumber {
            nums[i] *= 10
            nums[i] += char.wholeNumberValue!
          }
        }

        numbers[i] = nums
      }
    }

    var sum = 0

    // Preform the operations
    for (i, op) in ops.enumerated() {
      let nums = numbers[i]
      switch op {
      case .add:
        sum += nums.reduce(0, +)
      case .multiply:
        sum += nums.reduce(1, *)
      }
    }

    return String(sum)
  }

  enum SolutionError: Error {
    case invalidInput
  }

  enum Operation {
    case add
    case multiply
  }
}
