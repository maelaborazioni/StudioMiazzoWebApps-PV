/**
 * @properties={typeid:24,uuid:"01C441A7-BC21-4B33-AFAB-A99A356F4C4E"}
 * @AllowToRunInFind
 */
function ma_pv_onSolutionOpen(startArgs)
{
	try
	{
		/** @type {JSFoundset<db:/ma_anagrafiche/ditte>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.DITTE);
			fs.loadAllRecords();
			
		var companies = globals.foundsetToArray(fs, 'idditta_sede');
			
		// Exclude all requests for companies the user hasn't access to
		databaseManager.addTableFilterParam
		(
				  globals.Server.MA_RICHIESTE
				, globals.Table.LAVORATORI_RICHIESTE
				, 'idditta'
				, globals.ComparisonOperator.IN
				, companies
				, 'ftr_lavoratori_richieste_ditta'
		);
		
		// Exclude all disabled categories
		databaseManager.addTableFilterParam
		(
				  globals.Server.MA_RICHIESTE
				, globals.Table.CATEGORIE_RICHIESTE
				, 'abilitato'
				, globals.ComparisonOperator.EQ
				, 1
				, 'ftr_categorie_richieste_abilitate'
		);
		
		// Exclude all requests for owners other than the login one (only for the 'Sede' key)
		if(!globals.ma_utl_hasKeySede())
			databaseManager.addTableFilterParam
			(
					  globals.Server.MA_RICHIESTE
					, globals.Table.LAVORATORI_RICHIESTE
					, 'owner_id'
					, globals.ComparisonOperator.EQ
					, globals.svy_sec_lgn_owner_id
					, 'ftr_lavoratori_richieste_owner'
			);
		
		// Start jobs to check for updated and expired requests
		startCheckForExpiredRequests(); 				 // at every login
		startCheckForUpdatedRequests('0 0/30 * * * ?');  // every hour at o'clock and a half
	}
	catch(ex)
	{
		application.output(ex.message, LOGGINGLEVEL.ERROR);
	}
}