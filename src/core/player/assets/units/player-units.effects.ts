import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { PlayerUnit } from './player-unit.model';
import { PlayerUnitsActions } from './player-units.actions';
import { PlayerUnitsService } from './player-units.service';

import { ContractsService } from '../../../shared/contracts.service';
import { Status } from '../../../shared/status.model';

import { PlayerResourcesActions } from '../../resources/player-resources.actions';
import { Web3Actions } from '../../../web3/web3.actions';
import { Web3Service } from '../../../web3/web3.service';

@Injectable()
export class PlayerUnitsEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private playerUnitsService: PlayerUnitsService,
              private web3Service: Web3Service) {
  }


  @Effect({dispatch: false}) getPlayerUnitsLength$ = this.actions$
    .ofType(PlayerUnitsActions.Types.GET_PLAYER_UNITS)
    .do((action) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      return this.web3Service.callContract(
        this.contractsService.UserUnitsInstance.getUserUnitsAndQuantities,
        [activeAccount, {from: activeAccount}]
      ).then((result) => {
        if (result.error) {
          return this.store.dispatch(new PlayerUnitsActions.GetPlayerUnitsFailure({
            status: new Status({ error: result.error })
          }));
        }
        if (result.length === 0) {
          return this.store.dispatch(new PlayerUnitsActions.GetPlayerUnitsSuccess([]));
        }
        return this.store.dispatch(new PlayerUnitsActions.GetPlayerUnitsSuccess(
          result[0].map((unitId, i) => new PlayerUnit({
            id: unitId.toNumber(),
            quantity: result[1][i].toNumber(),
          }))
        ));
      })
    })

}
