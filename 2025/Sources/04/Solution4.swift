import Foundation

struct Solution4: Solution {
  func partA(input: String) throws -> String {
    let map = getMap(mapStr: input)
    var sum = 0
    for x in 1..<(map.count - 1) {
      for y in 1..<(map[x].count - 1) {
        let val = map[x][y]
        if val > 0 && val <= 4 {
          sum += 1
        }
      }
    }
    return String(sum)
  }

  func partB(input: String) throws -> String {
    var map = getMap(mapStr: input)
    var sum = 0
    var lastSum = -1
    while sum != lastSum {
      lastSum = sum
      for x in 1..<(map.count - 1) {
        for y in 1..<(map[x].count - 1) {
          let val = map[x][y]
          if val > 0 && val <= 4 {
            sum += 1
            map = incMap(map: map, x: x, y: y, val: -1)
            map[x][y] = 0
          }
        }
      }
    }
    return String(sum)

  }

  func incMap(map: [[Int]], x: Int, y: Int, val: Int = 1) -> [[Int]] {
    var map = map
    map[x - 1][y - 1] += val
    map[x - 1][y] += val
    map[x - 1][y + 1] += val
    map[x][y - 1] += val
    map[x][y] += val
    map[x][y + 1] += val
    map[x + 1][y - 1] += val
    map[x + 1][y] += val
    map[x + 1][y + 1] += val
    return map
  }

  func getMap(mapStr: String) -> [[Int]] {
    let lines = mapStr.split(separator: "\n")
    // Add padding on all sides, so we can skip bounds checking
    var map = Array(repeating: Array(repeating: 0, count: lines.first!.count + 2), count: lines.count + 2)

    for (unpaddedY, line) in lines.enumerated() {
      for (unpaddedX, char) in line.enumerated() {
        switch char {
        case "@":
          map = incMap(map: map, x: unpaddedX + 1, y: unpaddedY + 1)
        case ".":
          break
        default:
          fatalError("Invalid char \(char)")
        }
      }
    }

    for (unpaddedY, line) in lines.enumerated() {
      for (unpaddedX, char) in line.enumerated() {
        if char == "." {
          map[unpaddedX + 1][unpaddedY + 1] = 0
        }
      }
    }

    return map
  }
}
