import {directions, get_directions} from "../utils";
import {TileEvent, event_types} from "./TileEvent";

export class SpeedEvent extends TileEvent {
    private _speed: number;
    private _speed_activate_directions: Set<directions>;
    private _force_axis: "x" | "y";
    private _on_stairs: boolean;
    private _previous_on_stairs: boolean;

    constructor(
        game,
        data,
        x,
        y,
        activation_directions,
        initial_disabled_directions,
        activation_collision_layers,
        active_storage_key,
        affected_by_reveal,
        key_name: string,
        speed: number,
        speed_activate_directions,
        on_stairs,
        force_axis
    ) {
        super(
            game,
            data,
            event_types.SPEED,
            x,
            y,
            activation_directions,
            initial_disabled_directions,
            activation_collision_layers,
            active_storage_key,
            null,
            affected_by_reveal,
            key_name
        );
        this._speed = speed;
        this._speed_activate_directions = new Set();
        this._force_axis = force_axis;
        this._on_stairs = on_stairs;
        this._previous_on_stairs = false;
        if (speed_activate_directions === undefined || speed_activate_directions === "all") {
            get_directions(true).forEach(d => this._speed_activate_directions.add(d));
        } else if (Array.isArray(directions)) {
            speed_activate_directions.forEach(d => this._speed_activate_directions.add(directions[d as string]));
        } else {
            this._speed_activate_directions.add(directions[speed_activate_directions as string]);
        }
    }

    get speed() {
        return this._speed;
    }

    unset() {
        if (
            this.data.tile_event_manager.event_triggered(this) &&
            (!this.check_position() || !this._speed_activate_directions.has(this.data.hero.current_direction))
        ) {
            this.data.tile_event_manager.unset_triggered_event(this);
            if (this._force_axis) {
                this.data.hero.increase_forced_extra_speed({[this._force_axis]: -this.speed});
            } else {
                this.data.hero.increase_extra_speed(-this.speed);
            }
            if (this._on_stairs) {
                this.data.hero.on_stair = this._previous_on_stairs;
            }
        }
    }

    fire() {
        if (
            !this.data.tile_event_manager.event_triggered(this) &&
            this._speed_activate_directions.has(this.data.hero.current_direction)
        ) {
            this.data.tile_event_manager.set_triggered_event(this);
            if (this._force_axis) {
                this.data.hero.increase_forced_extra_speed({[this._force_axis]: this.speed});
            } else {
                this.data.hero.increase_extra_speed(this.speed);
            }
            if (this._on_stairs) {
                this._previous_on_stairs = this.data.hero.on_stair;
                this.data.hero.on_stair = this._on_stairs;
            }
        }
    }

    destroy() {
        this._origin_interactable_object = null;
        this.deactivate();
    }
}
