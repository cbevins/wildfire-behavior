## Classes are Data Containers Intended for Re-Use

Classes are designed with an update(params) method, so that instance properties properties are recalculated.
- 'new' class instances do not need to be created with each change in 'params',
- reducing memory allocation and garbage collection,
- Multiple class instances are not held in memory (perhaps by references held to them).
- Multiple instances **may** be held in memory when required by the use-case.
- Intermediate variables are not stored as properties.

## Class Methods Take a Single 'Params' Object Argument

- All the *params* properties are named.
- Order of *params* properties is irrelevant.
- Inside the method, properties are destructured with reasonable default values.
- *params* may contain any additional properties not used by the method, so that,
for example, *params* could contain **all**

## Classes Are Steps the Wildland Fire Simulation Processing Chain

Wildland fire simulation is an ordered sequence of computations where steps
are separated by the introduction of new context parameters:
- FuelModelCatalog defines the available standard and custom fuel models.
- FuelBed determines the fuel bed's spatial physical properties based on fuel model and curing.
- FuelIgnition determines the fuel bed's temporal ignition properties based on fuel moisture content.
- FireBehavior determines fire spread rate, intensity, heading direction, and length-to-width ratio
based on wind speed and direction, and slope steepness and aspect.
- FireShape determines the fire ellipse expansion rate parameters based on FireBehavior properties.
- FireSize determines the fire ellipse size and location based on elapsed time and ignition point.
- FireVector[Head|Back|Beta|Beta6] determine the spread rate, intensity, distance, and location
of fire vectors starting from the ignition point and oriented at some input angle from the fire head.
- FireVectorPsi determine the spread rate, intensity, distance, and location
of fire vectors from a fire front heading oriented at some angle from the wind bearing.

Depending on use-case, any slice of the above steps may be required by the client.

