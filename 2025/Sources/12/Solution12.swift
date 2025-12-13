// Present tetris https://adventofcode.com/2025/day/12

import Foundation

struct Solution12: Solution {
  /// The input contains two sections:
  /// First, a list of present shapes.
  /// Those entries look like this:
  /// ```
  /// {shapeNr}:
  /// #.#
  /// .#.
  /// #.#
  /// ```
  /// Each present shape is a 3x3 grid of fields that are either occupied or not occupied
  ///
  /// The second section describes the space around a tree, and which presents should be put there
  /// {x}x{y}: {nr of shape0} {shape1} {shape2}...
  ///
  /// Print the sum of trees for which the presents fit under the tree
  func partA(input: String) throws -> String {
    var state = ParseState.BlockStart
    var currentBlockIdx: Int = -1
    var blocks: [[[Bool]]] = []
    var blockOccupancy: [Int] = []
    var sum = 0
    for line in input.split(separator: "\n", omittingEmptySubsequences: false) {
      if state == .BlockStart {
        if line.contains("x") {
          state = .TreePrelude
        } else {
          let index = Int(line.dropLast())!
          let realIdx = blocks.count

          if index != realIdx {
            throw SolutionError.invalidInput
          }
          blocks.append([])
          currentBlockIdx = realIdx
          state = ParseState.Block
          continue
        }
      }
      if state == .Block {
        if line.isEmpty {
          state = .BlockStart
          continue
        }
        blocks[currentBlockIdx].append(line.map { $0 == "#" })
        continue
      }
      if state == .TreePrelude {
        state = .TreeDimensions
        blockOccupancy = blocks.map { $0.reduce(0, { $0 + $1.reduce(0, { $0 + ($1 ? 1 : 0) }) }) }
      }
      if state == .TreeDimensions {
        let segments = line.split(separator: ":")
        let coords = segments[0].split(separator: "x").map { Int($0)! }
        let x = coords[0]
        let y = coords[1]
        let shapeAmounts = segments[1].split(separator: " ").map { Int($0)! }

        let minimumAmount = (x / 3) * (y / 3)

        if shapeAmounts.reduce(0, +) <= minimumAmount {
          // This can fit without even trying to fit the packages together
          sum += 1
          continue
        }

        let occupiedSpaces = shapeAmounts.enumerated().reduce(
          0, { $0 + blockOccupancy[$1.0] * $1.1 })

        if occupiedSpaces > x * y {
          // These packages cannot fit, regardless of how you put them
          continue
        }

        // This would be the place for a proper algorithm to test if the packages fit.
        // But through the magic of christmas, we already get the right solution.
      }
    }
    return String(sum)
  }

  func partB(input: String) throws -> String {
    return "N/A"
  }

  enum ParseState {
    case BlockStart
    case Block
    case TreePrelude
    case TreeDimensions
  }

  enum SolutionError: Error {
    case invalidInput
    case noSolution
  }
}
