/*global VisSense,jasmine,describe,it,expect,beforeEach,afterEach,spyOn*/
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSense Monitor', function() {
    'use strict';

    //var noop = function() { /*empty*/ };

    // TODO: uncomment this if jasmine supports mocking the Date object natively
    //it('should verify that jasmine mocks the Date object', function () {
    //    expect(jasmine.clock().mockDate).toBeDefined();
    //});

    describe('VisState', function() {

        it('should create all 3 VisState objects', function () {
            expect(VisSense.VisState.hidden(0)).toBeDefined();
            expect(VisSense.VisState.visible(0.1)).toBeDefined();
            expect(VisSense.VisState.fullyvisible(1)).toBeDefined();
        });

    });


    describe('strategies', function() {

        describe('Strategy', function() {
            var strategy;

            beforeEach(function() {
                strategy = new VisSense.VisMon.Strategy();
            });

            it('should throw error on start', function () {
                expect(function() {
                    strategy.start();
                }).toThrow();
            });

            it('should throw error on stop', function () {
                expect(function() {
                    strategy.stop();
                }).toThrow();
            });
        });

        describe('NoopStrategy', function() {
            var strategy;

            beforeEach(function() {
                strategy = new VisSense.VisMon.Strategy.NoopStrategy();
            });

            it('should idle on start()', function () {
                expect(strategy.start({ update: VisSense.Utils.noop })).not.toBeDefined();
            });

            it('should idle on stop()', function () {
                expect(strategy.stop()).not.toBeDefined();
            });
        });

        describe('PollingStrategy', function() {
            var strategy;

            beforeEach(function() {
                strategy = new VisSense.VisMon.Strategy.PollingStrategy();
            });

            it('should return true on start()', function () {
                expect(strategy.start({ update: VisSense.Utils.noop })).toBe(true);
            });

            it('should return true on stop()', function () {
                strategy.start({ update: VisSense.Utils.noop });
                expect(strategy.stop()).toBe(true);
            });
            it('should return false on stop() when not running', function () {
                expect(strategy.stop()).toBe(false);
            });
        });

        describe('EventStrategy', function() {
            var strategy;

            beforeEach(function() {
                strategy = new VisSense.VisMon.Strategy.EventStrategy();
            });

            it('should return true on start()', function () {
                expect(strategy.start({ update: VisSense.Utils.noop })).toBe(true);
            });

            it('should return true on stop()', function () {
                strategy.start({ update: VisSense.Utils.noop });
                expect(strategy.stop()).toBe(true);
            });
            it('should return false on stop() when not running', function () {
                expect(strategy.stop()).toBe(false);
            });
        });

    });

    describe('VisMon', function() {
        var element, visobj;

        beforeEach(function() {

           element = document.createElement('div');
           element.id = 'testNode1';
           visobj = new VisSense(element);

           jasmine.clock().install();

            //jasmine.clock().mockDate();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('should create VisMon objects', function () {
            var vismon = visobj.monitor();

            var vismon2 = visobj.monitor({
                update : VisSense.Utils.noop,
                hidden : VisSense.Utils.noop,
                visible : VisSense.Utils.noop,
                fullyvisible : VisSense.Utils.noop,
                percentagechange : VisSense.Utils.noop,
                visibilitychange : VisSense.Utils.noop
            });

            expect(vismon).toBeDefined();
            expect(vismon2).toBeDefined();
        });

        it('should update state when update() is executed', function () {
            var config = {
                 update : function() {
                 }
            };
            var vismon = visobj.monitor(config);

            expect(vismon.state()).toEqual({});

            vismon.update();

            expect(vismon.state()).toBeDefined();

        });

        it('should update verify that first update() argument is a monitor', function () {
            var counter = 0;
            var config = {
                 update : function(monitor) {
                    expect(monitor).toBe(vismon);
                    counter++;
                 }
            };
            var vismon = visobj.monitor(config);
            vismon.update();
            expect(counter).toBe(1);
        });

        it('should verify that state instances are cached if nothing changes', function () {
            var config = {
                 update : function() {
                 }
            };
            var vismon = visobj.monitor(config);

            expect(vismon.state()).toEqual({});

            vismon.update();

            expect(vismon.state().state).toBeDefined();
            expect(vismon.state().code).toBeDefined();
            expect(vismon.state().hidden).toBeDefined();
            expect(vismon.state().visible).toBeDefined();
            expect(vismon.state().fullyvisible).toBeDefined();
            expect(vismon.state().percentage).toBeDefined();
            expect(vismon.state().previous).toBeDefined();

            vismon.update();

            var cachedState = vismon.state();
            expect(cachedState.hidden).toBeDefined();

            vismon.update();

            expect(vismon.state()).toBe(cachedState);

        });

        it('start/stop/use NoopStrategy', function () {
            var config = {
                strategy: VisSense.VisMon.Strategy.NoopStrategy(),
                update : function() {}
            };

            var vismon = visobj.monitor(config);

            expect(vismon.state()).toEqual({});

            vismon.start();

            var firstState = vismon.state();
            expect(firstState).toBeDefined();
            expect(firstState).toBeDefined();
            expect(firstState.previous).toEqual({});

            vismon.update();

            var secondState = vismon.state();
            expect(secondState).toBeDefined();
            expect(secondState.hidden).toBeDefined();
            expect(secondState.previous).not.toEqual({});

            vismon.stop();

            vismon.use(config.strategy);
        });

        it('should return -1 on registering handler for invalid event', function () {
            var config = {
                strategy: VisSense.VisMon.Strategy.NoopStrategy(),
                update : function() {}
            };

            var vismon = visobj.monitor(config);

            var handlerId = vismon.on('non-existing-event', function() {
                // empty
            });

            expect(handlerId).toBe(-1);
        });

        it('should verify values on state changes', function () {
            var config = {
                strategy: VisSense.VisMon.Strategy.NoopStrategy(),
                update : function() {}
            };

            var vismon = visobj.monitor(config);

            vismon.start();

            var firstState  = vismon.state();

            expect(firstState.state).toBe('hidden');
            expect(firstState.hidden).toBe(true);
            expect(firstState.visible).toBe(false);
            expect(firstState.fullyvisible).toBe(false);

            expect(firstState.previous).toEqual({});
            expect(firstState.previous.state).toBeUndefined();

            // from undefined to 'hidden'
            expect(firstState.code !== firstState.previous.code).toBe(true);

            vismon.update();

            var secondState  = vismon.state();

            expect(secondState.state).toBe('hidden');
            expect(secondState.hidden).toBe(true);
            expect(secondState.visible).toBe(false);
            expect(secondState.fullyvisible).toBe(false);

            expect(secondState.previous.state).toBe('hidden');
            expect(secondState.previous.hidden).toBe(true);
            expect(secondState.previous.visible).toBe(false);
            expect(secondState.previous.fullyvisible).toBe(false);

            expect(secondState.code !== secondState.previous.code).toBe(false);
        });

        describe('Events', function() {
            it('should verify update event is triggered on call to update()', function() {
                var config = {
                    strategy: VisSense.VisMon.Strategy.NoopStrategy(),
                    update : function() {},
                    visible : function() {},
                    hidden : function() {},
                    visibilitychange: function() {},
                    percentagechange: function() {}
                };

                spyOn(config, 'update');
                spyOn(config, 'hidden');
                spyOn(config, 'visible');
                spyOn(config, 'visibilitychange');
                spyOn(config, 'percentagechange');

                var vismon = visobj.monitor(config);

                expect(config.update.calls.count()).toEqual(0);
                expect(config.hidden.calls.count()).toEqual(0);
                expect(config.visible.calls.count()).toEqual(0);
                expect(config.visibilitychange.calls.count()).toEqual(0);
                expect(config.percentagechange.calls.count()).toEqual(0);

                vismon.start();

                expect(config.update.calls.count()).toEqual(1);
                expect(config.hidden.calls.count()).toEqual(1);
                expect(config.visible.calls.count()).toEqual(0);
                expect(config.visibilitychange.calls.count()).toEqual(1);
                expect(config.percentagechange.calls.count()).toEqual(1);

                vismon.update();

                expect(config.update.calls.count()).toEqual(2);
                expect(config.hidden.calls.count()).toEqual(1);
                expect(config.visible.calls.count()).toEqual(0);
                expect(config.visibilitychange.calls.count()).toEqual(1);
                expect(config.percentagechange.calls.count()).toEqual(1);

                vismon.update();

                expect(config.update.calls.count()).toEqual(3);
                expect(config.hidden.calls.count()).toEqual(1);
                expect(config.visible.calls.count()).toEqual(0);
                expect(config.visibilitychange.calls.count()).toEqual(1);
                expect(config.percentagechange.calls.count()).toEqual(1);

            });
        });
    });

});
