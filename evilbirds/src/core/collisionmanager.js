
class CollisionManager{

    constructor(collisionIndex) {
        
        this.collisionIndex = collisionIndex;

    }

    boxIntersectsSphere( minx, miny, minz, maxx, maxy, maxz, sx, sy, sz, sr ) {

        var x = Math.max( minx, Math.min( maxx, sx ) ) - sx;
        var y = Math.max( miny, Math.min( maxy, sy ) ) - sy;
        var z = Math.max( minz, Math.min( maxz, sz ) ) - sz;
    
        var distance = Math.hypot( x, y, z );
    
        if ( distance > sr ) return false;
    
        var overlap = sr - distance;
    
        if ( distance > 0 ) {
    
            x /= distance;
            y /= distance;
            z /= distance;
    
        } else {
    
            x = 1;
            y = 0;
            z = 0;
    
        }
    
        return {
    
            minOverlap: overlap,
            mtvX: x,
            mtvY: y,
            mtvZ: z,
    
        };
    
    }

    sphereIntersectsBox( sx, sy, sz, sr, minx, miny, minz, maxx, maxy, maxz ) {

        var result = this.boxIntersectsSphere( minx, miny, minz, maxx, maxy, maxz, sx, sy, sz, sr );
    
        if ( result ) {
    
            result.mtvX *= - 1;
            result.mtvY *= - 1;
            result.mtvZ *= - 1;
    
        }
    
        return result;
    
    }
    

    check(camera, sphere) {
        var sphereRadius = 0.5;
        for (var i = 0; i < this.collisionIndex.length; i++){
            var collisionObject = this.collisionIndex[i];
            var intersection = this.sphereIntersectsBox(
                sphere.position.x,
                sphere.position.y,
                sphere.position.z,
                sphereRadius,
                collisionObject.min.x,
                collisionObject.min.y,
                collisionObject.min.z,
                collisionObject.max.x,
                collisionObject.max.y,
                collisionObject.max.z,
            )
            if (intersection) {   
                camera.position.x += intersection.mtvX * intersection.minOverlap / 2;
                camera.position.y += intersection.mtvY * intersection.minOverlap / 2;
                camera.position.z += intersection.mtvZ * intersection.minOverlap / 2;
            } 
        }
    }

}

export {CollisionManager};