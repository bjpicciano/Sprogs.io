var Projectile = IgeEntityBox2d.extend({
    classId: 'Projectile',

    init: function(id, mouseAngleFromPlayer) {
        IgeEntityBox2d.prototype.init.call(this);
        this.category("Projectile");

        var self = this;
        
        if (ige.isServer) {
            if(ige.box2d){
                // Setup the box2d physics properties
                self.box2dBody({
                    type: 'dynamic',
                    linearDamping: 3,
                    angularDamping: 0.5,
                    allowSleep: false,
                    bullet: true,
                    fixtures: [{
                        shape: {
                            type: 'circle',
                            data: {
                                radius: 1
                            }
                        }
                    }]
                });

                var serverProperties = {
                    damage: 34,
                };

                this.serverProperties = serverProperties;

                this.on('collisionStart', '.Player', function (contactData) {
                    if (contactData.igeEntityA()._category == "Player") {
                        contactData.igeEntityA().hurt(serverProperties.damage);

                        contactData.igeEntityB().destroy();
                    }

                    if (contactData.igeEntityB()._category == "Player") {
                        contactData.igeEntityB().hurt(this.serverProperties.damage);

                        contactData.igeEntityB().destroy();
                    }

                });
            }

            this.streamMode(1);
            this.lifeSpan(500);
        }

        if (ige.isClient) {
            self.texture(ige.client.textures.orb)
                .width(5)
                .height(5)
        }
    },
    
    shoot: function (pos, angle) {
        var dis = 40;
        var vel = 40;
        
        var dx = Math.cos(angle);
        var dy = Math.sin(angle);
        
        this.translateTo(dx * dis + pos.x, dy * dis + pos.y, 0);

        this._box2dBody.SetLinearVelocity(new IgePoint3d(vel * dx, vel * dy, 0));
    },

    hurt: function () {
        this.destroy();
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Projectile; }