const test = require('ava')

const { subtract, union } = require('../../../operations/booleans')
const square = require('../../../primitives/square')
const assignHoles = require('./assignHoles')

test('slice: assignHoles() should return a polygon hierarchy', (t) => {
  const exp1 = [{
    solid: [
      [-3.000013333333334, -3.000013333333334],
      [3.000013333333334, -3.000013333333334],
      [3.000013333333334, 3.000013333333334],
      [-3.000013333333334, 3.000013333333334]
    ],
    holes: [[
      [-1.9999933333333335, 1.9999933333333335],
      [1.9999933333333335, 1.9999933333333335],
      [1.9999933333333335, -1.9999933333333335],
      [-1.9999933333333335, -1.9999933333333335]
    ]]
  }]
  const geometry = subtract(
    square({ size: 6 }),
    square({ size: 4 })
  )
  const obs1 = assignHoles(geometry)
  t.deepEqual(obs1, exp1)
})

test('slice: assignHoles() should handle nested holes', (t) => {
  const geometry = union(
    subtract(
      square({ size: 6 }),
      square({ size: 4 })
    ),
    subtract(
      square({ size: 10 }),
      square({ size: 8 })
    )
  )
  const obs1 = assignHoles(geometry)

  const exp1 = [
    {
      solid: [
        [-3.0000006060444444, -3.0000006060444444],
        [3.0000006060444444, -3.0000006060444444],
        [3.0000006060444444, 3.0000006060444444],
        [-3.0000006060444444, 3.0000006060444444]
      ],
      holes: [[
        [-2.0000248485333336, 2.0000248485333336],
        [2.0000248485333336, 2.0000248485333336],
        [2.0000248485333336, -2.0000248485333336],
        [-2.0000248485333336, -2.0000248485333336]
      ]]
    },
    {
      solid: [
        [-5.000025454577778, -5.000025454577778],
        [5.000025454577778, -5.000025454577778],
        [5.000025454577778, 5.000025454577778],
        [-5.000025454577778, 5.000025454577778]
      ],
      holes: [[
        [-3.9999763635555556, 3.9999763635555556],
        [3.9999763635555556, 3.9999763635555556],
        [3.9999763635555556, -3.9999763635555556],
        [-3.9999763635555556, -3.9999763635555556]
      ]]
    }
  ]
  t.deepEqual(obs1, exp1)
})
