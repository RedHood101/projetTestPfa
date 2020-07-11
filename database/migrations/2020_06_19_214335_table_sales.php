<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class TableSales extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->string('region',33);
            $table->string('country',32);
            $table->string('item_type',15);
            $table->string('sales_channel',7);
            $table->string('order_priority',1);
            $table->dateTime('order_date');
            $table->bigInteger('Order_id');
            $table->dateTime('ship_date');
            $table->Integer('units_sold');
            $table->decimal('unit_price',5,2);
            $table->decimal('unit_cost',5,2);
            $table->decimal('total_revenue',9,2);
            $table->decimal('total_cost',9,2);
            $table->decimal('total_profit',9,2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sales');
    }
}
