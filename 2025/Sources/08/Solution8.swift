import Foundation

// The traveling junction box problem https://adventofcode.com/2025/day/8
struct Solution8: Solution {
  // The input is a list of 3D coordinates
  // Connect the closest n points
  // Multiply the 3 largest clusters
  func partA(input: String) throws -> String {
    let lines = input.split(separator: "\n")
    // Account for differences in n between sample and real input
    let n = lines.count <= 100 ? 10 : 1000

    let points = lines.enumerated().map({
      let components = $1.split(separator: ",")
      let x = Int(components[0])!
      let y = Int(components[1])!
      let z = Int(components[2])!
      return Point(x: x, y: y, z: z)
    })

    var pointsConnected = 0
    var clusterSizes = [Int]()
    var clusterPerPoint = Array(repeating: -1, count: points.count)
    // Shortest distances first
    let pairsByDistance = try getPairsByDistance(points: points)

    // Connect the junction boxes and manage the clusters
    for pointPair in pairsByDistance {
      let pointA = pointPair.0
      let pointB = pointPair.1
      let clusterA = clusterPerPoint[pointA]
      let clusterB = clusterPerPoint[pointB]
      pointsConnected += 1
      if clusterA == -1 && clusterB == -1 {
        // Neither point is in a cluster yet
        // Make a new one with 2 points
        clusterSizes.append(2)
        clusterPerPoint[pointA] = clusterSizes.count - 1
        clusterPerPoint[pointB] = clusterSizes.count - 1
      } else if clusterA == -1 {
        // Point A is not in a cluster yet, put it in the cluster of point B
        clusterPerPoint[pointA] = clusterB
        clusterSizes[clusterB] += 1
      } else if clusterB == -1 {
        // Point B is not in a cluster yet, put it in the cluster of point A
        clusterPerPoint[pointB] = clusterA
        clusterSizes[clusterA] += 1
      } else if clusterA != clusterB {
        // Both A and B are in different clusters, merge them
        for i in 0..<clusterPerPoint.count {
          // Move all points from cluster B to cluster A
          if clusterPerPoint[i] == clusterB {
            clusterPerPoint[i] = clusterA
          }
        }
        clusterSizes[clusterA] += clusterSizes[clusterB]
        clusterSizes[clusterB] = 0
      }
      if pointsConnected >= n {
        break
      }
    }

    let sortedClusterSizes = clusterSizes.sorted(by: { $0 > $1 })

    return String(sortedClusterSizes[0] * sortedClusterSizes[1] * sortedClusterSizes[2])
  }

  // The input is a list of 3D coordinates
  // Connect the closest points until all points are connected
  // Return the product of the x coordinates of the last two points
  func partB(input: String) throws -> String {
    let lines = input.split(separator: "\n")
    let points = lines.enumerated().map({
      let components = $1.split(separator: ",")
      let x = Int(components[0])!
      let y = Int(components[1])!
      let z = Int(components[2])!
      return Point(x: x, y: y, z: z)
    })

    // Shortest distances first
    let pairsByDistance = try getPairsByDistance(points: points)

    var clusterSizes = [Int]()
    var clusterPerPoint = Array(repeating: -1, count: points.count)
    var lastPointPair: (Int, Int)?

    // Connect the junction boxes and manage the clusters
    for pointPair in pairsByDistance {
      lastPointPair = pointPair
      let pointA = pointPair.0
      let pointB = pointPair.1
      let clusterA = clusterPerPoint[pointA]
      let clusterB = clusterPerPoint[pointB]
      if clusterA == -1 && clusterB == -1 {
        // Neither point is in a cluster yet
        // Make a new one with 2 points
        clusterSizes.append(2)
        clusterPerPoint[pointA] = clusterSizes.count - 1
        clusterPerPoint[pointB] = clusterSizes.count - 1
      } else if clusterA == -1 {
        // Point A is not in a cluster yet, put it in the cluster of point B
        clusterPerPoint[pointA] = clusterB
        clusterSizes[clusterB] += 1
      } else if clusterB == -1 {
        // Point B is not in a cluster yet, put it in the cluster of point A
        clusterPerPoint[pointB] = clusterA
        clusterSizes[clusterA] += 1
      } else if clusterA != clusterB {
        // Both A and B are in different clusters, merge them
        // The one with the higher index gets removed
        // This is so that all points eventually converge in cluster 0
        let lower = min(clusterA, clusterB)
        let higher = max(clusterA, clusterB)

        for i in 0..<clusterPerPoint.count {
          if clusterPerPoint[i] == higher {
            clusterPerPoint[i] = lower
          }
        }
        clusterSizes[lower] += clusterSizes[higher]
        // No need for cleanup, since we don't only index 0 matters in the end
        // clusterSizes[higher] = 0
      }

      if clusterSizes[0] == points.count {
        break
      }
    }

    guard let lastPointPair = lastPointPair else {
      throw SolutionError.noLastPointPair
    }

    return String(points[lastPointPair.0].x * points[lastPointPair.1].x)
  }

  func getPairsByDistance(points: [Point]) throws -> [(Int, Int)] {
    // Store the distances between each point and every other point
    // We are using a dictionary, since we really care about the distance value and want to sort
    // by it, but after that we also need the points.
    var distances = [Int: (Int, Int)]()
    for x in 0..<points.count {
      let pointX = points[x]
      for y in (x + 1)..<points.count {
        let pointY = points[y]
        let dist = pointX.distance(to: pointY)
        if distances[dist] != nil {
          // Technically this is possible in the constraints of the puzzle, but it doesn't happen.
          // And assuming it won't happen makes the code simpler and faster.
          // Make it an array if you have to
          throw SolutionError.distanceCollision
        }
        distances[dist] = (x, y)
      }
    }

    return distances.sorted(by: { $0.key < $1.key }).map({ $0.value })
  }

  enum SolutionError: Error {
    case noLastPointPair
    case distanceCollision
  }

  struct Point: Equatable {
    let x: Int
    let y: Int
    let z: Int

    func distance(to: Point) -> Int {
      let x = Int(pow(Double(abs(x - to.x)), 2.0))
      let y = Int(pow(Double(abs(y - to.y)), 2.0))
      let z = Int(pow(Double(abs(z - to.z)), 2.0))
      return x + y + z
    }
  }
}
