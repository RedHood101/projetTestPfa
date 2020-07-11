<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
//Homepage
Route::get('/', function () {
    return view('welcome');
});

//Api-GET
Route::get('/sales','SaleController@get')->name('get_sales');
    //->middleware('auth');
Route::get('/countries','SaleController@getCountries')->name('get_countries')
    ->middleware('auth');
Route::get('/country_data','CountryController@countriesData')->name('countries')
    ->middleware('auth');
Route::get('/api_data','SaleController@allApiAdmin')->name('api_get')
    ->middleware('auth');

//Admin_dashboard
Route::get('/admin','SaleController@getStatistic')
    ->middleware('auth');

Route::get('admin/manage_sales','SaleController@manageSales')
   ->middleware('auth');
Route::post('admin/select_region','SaleController@regionSales')
    ->middleware('auth');
    Route::get('admin/visualSales',function(){
        return view('Dashboard/visualSales');
    })
   ->middleware('auth');

Route::get('season_data','SaleController@seasonData');
Route::get('sales_prediction','SaleController@seasonChart');


Route::get('admin/order_date_region','SaleController@getOrdersDateAndRegion')
    ->middleware('auth');

Route::get('admin/map','SaleController@getMap')
    ->middleware('auth');
Route::get('/logout','SaleController@logout')
    ->middleware('auth');


//Authentication
Auth::routes();
Route::get('/', 'HomeController@index')->name('home');
Route::get('admin/get_post_chart_data', 'SaleController@getChartData');