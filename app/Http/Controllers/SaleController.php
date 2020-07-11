<?php

namespace App\Http\Controllers;

use App\Sale;
use App\helpers\Database;
use App\statisticSale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Capsule\Manager as Capsule;
use PhpParser\Node\Expr\Array_;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;



class SaleController extends Controller
{
    public function get() {
        $sales = Sale::all();
        echo json_encode($sales);
    }

    public function getStatistic(){
        $count = Sale::all()->count();
        $min =statisticSale::where('summary',"min")->first();
        $max = statisticSale::where('summary',"max")->first();
        $stddev = statisticSale::where('summary',"stddev")->first();
        $mean = statisticSale::where('summary',"mean")->first();


       return view('Dashboard.index',compact('count','min','max','stddev','mean'));
    }

    public function manageSales(){
        $target = [];
        $regions = Sale::distinct()->get(['region']);
        return view('Dashboard.sales',compact('regions','target'));
    }

    public function regionSales(Request $request){
        $target = Sale::where('region',$request->region)->get();
        return $this->manageSales()->with(
            [
                'target' => $target
            ]
        );

    }

    public function getCountries(){

        new Database();
        $countries = Capsule::table('sales')->select(
            Capsule::raw('country '),
            Capsule::raw('count(order_id) as `orders`')
        )->groupBy('country')->get();

        echo json_encode(
          [
              "countries" => $countries
          ]
       );

    }

    public function getMap(){
        return view('Dashboard/map');
    }

    public function allApiAdmin(){
        return view('Dashboard/api');
    }

    public function getOrdersDateAndRegion(){
        new Database();
        $orders = Capsule::table('sales')->select(
            Capsule::raw("count(order_id) as `count`"),
            Capsule::raw("DATE_FORMAT(order_date,'%m-%y') date"),
            Capsule::raw("YEAR(order_date) year, Month(order_date) month")
        )->groupBy('year','month')->get();

        $regions = Capsule::table('sales')->select(
            Capsule::raw("region"),
            Capsule::raw("count(order_id) as `countO`")
        )->groupBy("region")->get();
        echo json_encode([
            "orders" => $orders,
            "regions" => $regions
        ]);
    }

    public function seasonData(){

     // return shell_exec("python ../../../../pyspark_script/statistics.py");
        new Database();
        $orders = Capsule::table('sales')->select(
            Capsule::raw("count(order_id) as `count`"),
            Capsule::raw("YEAR(order_date) year, Month(order_date) month")
        )->groupBy('year','month')->get();

        echo json_encode([
            'forcastingData' => $orders
        ]);
    }

    public function seasonChart(){
        new Database();

        $Dates = Capsule::table('sales')->select(
            Capsule::raw("YEAR(order_date) year")
        )->groupBy('year')->get();

        $dates = [];
        foreach ($Dates as $key=>$value){
            array_push($dates,$value->year);
        }
        $date = max($dates);


        $d =[];
        for ($i = $date+1 ; $i < $date+20;$i++){
            array_push($d,$i);
        };
        return view('Dashboard/seasonChart',compact('d'));
    }

    public function logout(){
        Auth::logout();
        return redirect('/');
    }

        //this funtion return the liste of years 
    public function getAllYears(){
        $year_array=array();
        $post=Sale::orderBy('order_date','ASC')->pluck('order_date');
        $post=json_decode($post);
        if(! empty($post)){
            foreach($post as $unformatted_date){
                $date=new \DateTime($unformatted_date);
                $year=$date->format('Y');
                $year_num=$date->format('y');
                $year_array[$year_num]=$year;
            }
        }
        return $year_array;
    }
    //this function retur the total_cost for a specific year
public function getYearlyPostCost($year){
    $yearly_post_cost=Sale::whereYear('order_date',$year)->get()->sum('total_cost');
    return $yearly_post_cost;
}

public function getYearlyPostCostData(){
$yearly_post_cost_array=array();
$year_array=$this->getAllYears();
$year_name_array=array();
if(! empty($year_array)){
    foreach($year_array as $year_num =>$year){
        $yearly_post_cost=$this->getYearlyPostCost($year);
        array_push($yearly_post_cost_array,$yearly_post_cost);
        array_push($year_name_array,$year);
    }
}
$yearly_post_data_array=array(
'years'=>$year_name_array,
'cost_year_data'=>$yearly_post_cost_array,

);

return $yearly_post_data_array;

}

    public function getChartData(){
        new Database();
        $orders = Capsule::table('sales')->select(
            Capsule::raw("SUM(total_cost) as `totalCost`"),
            Capsule::raw("SUM(total_revenue) as `totalRevenue`"),
            Capsule::raw("SUM(total_profit) as `totalProfit`"),
            Capsule::raw("YEAR(order_date) year")
        )->groupBy('year')->get();
        echo json_encode([
            "chartData" => $orders
        ]);


       
    }




}
