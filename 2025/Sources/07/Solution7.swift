import Foundation

// Tachyon manifold https://adventofcode.com/2025/day/7
struct Solution7: Solution {
  let splitter = "^".utf8.first!
  let start = "S".utf8.first!

  // - Beam starts at the top of the grid at S and moves downwards.
  // - When a beam hits a splitter ^, it splits into two beams at the left and right of the splitter.
  // - No more than one beam can be in a grid position at a time.
  func partA(input: String) throws -> String {
    let lines = input.split(separator: "\n")
    // Beams seem to only start at the top, and there are no splitters there.
    // isBeams keeps track across lines of whether the beam is currently in a grid position.
    var isBeam = lines.first!.utf8.map({ $0 == start })
    var sum = 0

    for line in lines.dropFirst() {
      for (i, char) in line.utf8.enumerated() {
        if char == splitter && isBeam[i] {
          sum += 1
          isBeam[i] = false
          // Luckily, the input data is formatted such that we don't need to bounds check
          isBeam[i - 1] = true
          isBeam[i + 1] = true
        }
      }
    }

    return String(sum)
  }

  // Quantum Tachyon Manifold
  // - Beam starts at the top of the grid at S and moves downwards.
  // - When a beam hits a splitter ^, it could either go left or right.
  // - Count the number of paths the beam can take through the grid
  func partB(input: String) throws -> String {
    // Basic outline of the algorithm:
    // - `beamTimeline` is a list with one entry per grid position, starts with all 0.
    // - The start position S in the first line sets `beamTimeline` at its position to 1
    // - Then for each line, if we hit a splitter, add the number at the current position to the
    //   left and right, then set the current position to 0.
    // - At the end, sum up all the numbers in `beamTimeline`
    let lines = input.split(separator: "\n")
    var beamTimeline = lines.first!.utf8.map({ $0 == start ? 1 : 0 })

    for line in lines.dropFirst() {
      // Since a splitter can change the value of the next entry in `beamTimeline`, it would
      // break the algorithm if we didn't save the previous value of `beamTimeline` before
      // changing it.
      let prevBeamTimeline = beamTimeline
      for (i, char) in line.utf8.enumerated() {
        if char == splitter {
          let val = prevBeamTimeline[i]
          beamTimeline[i - 1] += val
          beamTimeline[i + 1] += val
          beamTimeline[i] = 0
        }
      }
    }

    return String(beamTimeline.reduce(0, +))
  }

  enum SolutionError: Error {
    case invalidInput
  }

  enum Operation {
    case add
    case multiply
  }
}
