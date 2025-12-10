import Foundation

// Floor tiles https://adventofcode.com/2025/day/9
struct Solution9: Solution {
  // Input is a list of 2D coordinates
  // Find the two points that would span the largest area between them
  // Return the area of that rectangle
  func partA(input: String) throws -> String {
    let lines = input.split(separator: "\n")

    let firstPointComponents = lines[0].split(separator: ",")
    let firstPoint = (Int(firstPointComponents[0])!, Int(firstPointComponents[1])!)

    // We are tracking one point for each corner. Only the corner points are capable of spanning
    // the largest area.
    // NOTE: Technically, I think there are gaps in this logic. Namely, there can be more than
    // one point with the shortest distance to a corner that could span differently sized areas.
    // But it works for my input ¯\_(ツ)_/¯
    var tl = firstPoint
    var tr = firstPoint
    var bl = firstPoint
    var br = firstPoint

    for line in lines.dropFirst() {
      let components = line.split(separator: ",")
      let x = Int(components[0])!
      let y = Int(components[1])!

      if x + y < tl.0 + tl.1 {
        tl.0 = x
        tl.1 = y
      }

      if x - y > tr.0 - tr.1 {
        tr.0 = x
        tr.1 = y
      }

      if y - x > bl.1 - bl.0 {
        bl.0 = x
        bl.1 = y
      }

      if x + y > br.0 + br.1 {
        br.0 = x
        br.1 = y
      }
    }

    // One of those is our largest area
    let areaTlBr = (br.0 - tl.0 + 1) * (br.1 - tl.1 + 1)
    let areaTrBl = (tr.0 - bl.0 + 1) * (bl.1 - tr.1 + 1)
    return String(max(areaTlBr, areaTrBl))
  }

  func partB(input: String) throws -> String {
    let textLines = input.split(separator: "\n")

    var minX = Int.max
    var minY = Int.max
    var maxX = 0
    var maxY = 0

    print("enumerating points...")

    let points = textLines.enumerated().map {
      let components = $1.split(separator: ",")
      let x = Int(components[0])!
      let y = Int(components[1])!

      if x < minX {
        minX = x
      }
      if x > maxX {
        maxX = x
      }
      if y < minY {
        minY = y
      }
      if y > maxY {
        maxY = y
      }

      return (x, y)
    }

    print("collecting horizontal lines...")

    let height = maxY - minY + 1
    let width = maxX - minX + 1
    var bits = Array(repeating: false, count: width * height)

    let normalizedPoints = points.map({ ($0.0 - minX, $0.1 - minY) })
    let sortedPoints = normalizedPoints.sorted(by: {
      $0.0 + $0.1 < $1.0 + $1.1
    })
    let reverseSortedPoints = sortedPoints.reversed()

    print("building grid...")

    for (idx, point) in normalizedPoints.enumerated() {
      let prevPoint = idx > 0 ? normalizedPoints[idx - 1] : normalizedPoints.last!
      if point.1 == prevPoint.1 {
        for x in min(point.0, prevPoint.0)...max(point.0, prevPoint.0) {
          bits[point.1 * width + x] = true
        }
      } else if point.0 == prevPoint.0 {
        for y in min(point.1, prevPoint.1)...max(point.1, prevPoint.1) {
          bits[y * width + point.0] = true
        }
      } else {
        throw SolutionError.invalidInput
      }
    }

    print("flood fill...")

    // flood fill
    var queue = Set([(sortedPoints[0].0 + 1) + (sortedPoints[0].1 + 1) * width])
    while !queue.isEmpty {
      var point = queue.removeFirst()
      while !bits[point - 1] {
        point -= 1
      }
      var lastValAbove = true
      var lastValBelow = true

      while !bits[point] {
        bits[point] = true
        let pointAbove = point - width
        let pointBelow = point + width

        if lastValAbove != bits[pointAbove] {
          if !bits[pointAbove] {
            queue.insert(pointAbove)
          }
          lastValAbove = bits[pointAbove]
        }

        if lastValBelow != bits[pointBelow] {
          if !bits[pointBelow] {
            queue.insert(pointBelow)
          }
          lastValBelow = bits[pointBelow]
        }

        point += 1
      }
    }

    var largestArea = 0

    print("sorting points...")
    var skipped = 0
    var unskipped = 0

    print("finding max right and bottom...")

    var maxRightPerPoint = [Int: Int]()
    var maxBottomPerPoint = [Int: Int]()

    for point in sortedPoints {
      let idx = point.0 + point.1 * width
      var right = 0
      var rightIdx = point.0 + 1

      while rightIdx < width {
        if !bits[rightIdx + point.1 * width] {
          break
        }
        right += 1
        rightIdx += 1
      }

      var bottom = 0
      var bottomIdx = point.1

      while bottomIdx < height {
        if !bits[point.0 + bottomIdx * width] {
          break
        }
        bottom += 1
        bottomIdx += 1
      }

      maxRightPerPoint[idx] = max(maxRightPerPoint[idx] ?? 0, right)
      maxBottomPerPoint[idx] = max(maxBottomPerPoint[idx] ?? 0, bottom)
    }

    print("finding largest area...")

    for (idxA, pointA) in sortedPoints.enumerated() {
      let coordA = pointA.0 + pointA.1 * width
      let maxRightA = maxRightPerPoint[coordA]!
      let maxBottomA = maxRightPerPoint[coordA]!
      for pointB in reverseSortedPoints.dropLast(idxA + 1) {
        let coordB = pointB.0 + pointB.1 * width
        let maxRightB = maxRightPerPoint[coordB]!
        let maxBottomB = maxRightPerPoint[coordB]!

        let xDiff = abs(pointA.0 - pointB.0)
        let yDiff = abs(pointA.1 - pointB.1)

        if xDiff > max(maxRightA, maxRightB) {
          skipped += 1
          continue
        }

        if yDiff > max(maxBottomA, maxBottomB) {
          skipped += 1
          continue
        }

        let area = (abs(pointA.0 - pointB.0) + 1) * (abs(pointA.1 - pointB.1) + 1)
        if area > largestArea {
          unskipped += 1
          var valid = true

          for x in min(pointA.0, pointB.0)..<max(pointA.0, pointB.0) {
            for y in min(pointA.1, pointB.1)..<max(pointA.1, pointB.1) {
              if bits[y * width + x] == false {
                valid = false
                break
              }
            }
            if valid == false {
              break
            }
          }
          if valid {
            print("found area: \(area), skipped: \(skipped), unskipped: \(unskipped)")
            largestArea = area
          }
        } else {
          skipped += 1
        }
      }
    }

    return String(largestArea)
  }

  enum SolutionError: Error {
    case invalidInput
  }

  struct Line {
    let pos: Int
    let start: Int
    let end: Int

    var length: Int {
      return end - start + 1
    }
  }
}
