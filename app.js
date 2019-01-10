// BUDGET CONTROLLER
var BudgetController = (function(){

	// function constructor
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1; // to store the percentage calculated in calcPercentage, set to -1 because it is not defined
	};

	// create prototype method of Expense, so that all the objects of expense will inherit this method
	// totalIncome required to calculate the percentage
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100); // percentage of this exp object is equal to value of this exp obj divided by total income
		} else {
			this.percentage = -1;
		}		
	};

	// method to return the percentage calculated in above method
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	// function to calculate total sum
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	// create a method to add a new item and return it to public
	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			

			// create new item -- type comes from var input = UIctrl.getinput();
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// to push newItem to the array
			data.allItems[type].push(newItem);

			//return new element
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			// create an array with all the id number
			// difference between map and forEach is that map returns a whole new array, ids is the new array
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			// to get the index of the id
			index = ids.indexOf(id);

			// index can be -1 if it did not find the id in the ids array
			// splice method to delete the element, first argument is the position no. to start deleting from, second argument is the no. of elements to delete
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget: function() {

			// Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate Budget = Income - Expenses
			data.budget = data.totals.inc - data.totals.exp;

			// Calculate Percentage of Income we spent = Expenses/Income
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function() {
			// **method to calculate percentages on each exp item, method declared privately in budget controller

			// to calculate percentage for each and every exp object
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc; // returned array with all the percentages
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function() {
			console.log(data);
		}
	};


})();











// UI CONTROLLER
var UIController = (function(){

	var DOMstrings  = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensePercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		var numSplit, int, dec;	

		/*
		Add Decimal 2fixed
		dd Sign + -
		Add Comma
		*/

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};


	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getinput: function() {
			// Returning an Object in getinput method so as to consolidate the input fields as properties in one object
			return {
				type: document.querySelector(DOMstrings.inputType).value, // will be either 'inc' or 'exp'
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // to convert string value to decimal
			};			
		},


		addListItem: function(obj, type) {
			var html, newHtml, element;

			//create HTML String with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
						
			// replace placeholder text with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {

			// for more DOM Manipulations ----- https://blog.garstasio.com/you-dont-need-jquery/dom-manipulation/
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);

		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// Converting List fields to array using slice
			fieldsArr = Array.prototype.slice.call(fields);

			// delete each element from array
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
				//array[0].value = "";
			});

			fieldsArr[0].focus(); // to set the focus back to description

		},

		displayBudget: function(obj) {

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}

		},

		displayPercentages: function(percentages) {
			// creating Node List so that all the percentage values are stored in a list
			var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

			// method to display perc on UI
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});

		},

		displayMonth: function() {
			var now, month, year, months;

			now = new Date();

			months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

		},

		changedType: function() {
			var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		
		// Making DOMstring Object Public
		getDOMstrings: function() {
			return DOMstrings;
		}
	};

})();












// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

	var setupEventListeners = function() {
		
		// Copying DOMstrings to Controller Module
		var DOM = UICtrl.getDOMstrings();

		// Add Button Feature
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);


		// Enter Key Feature
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		// event listener added to container which has all the income and expenses to facilitate event deligation which means that instead of adding the event 
		// listener to each income and expense, we add it to the container and let the listener bubble up and get itself attached to all the inc/exp elements
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

	};
	

	var updateBudget = function() {

		// 1. Calculate the Budget
		budgetCtrl.calculateBudget();

		// 2. Return the Budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);

	};

	var updatePercentages = function() {
		// 1. Calculate the Percentages
		budgetCtrl.calculatePercentages();

		// 2. Read/Get them from the Budget Controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with new percentages
		UICtrl.displayPercentages(percentages);

	};

	// ctrlAddItem function is like a guiding function which tells other modules what to do
	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the field input data
		input = UICtrl.getinput(); // Calling the getinput method in controller
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the Budget Controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear fields
			UICtrl.clearFields();

			// 5. Calculate and Update the Budget
			updateBudget();

			// 6. Calculate and Update the Percentages
			updatePercentages();

		};

	};

	// access to the event object by putting 'event' parameter in below function, and event is required because we want to know what is the target element
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		
		// using event delegation we can get to know the target element by using target property
		// to get the item id
		// event.target is where the event was fired; parentNode to traverse the DOM up to get the ID
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		//console.log(itemID);

		// if statement so that the code happens only if there exist an ID, and not on click on rest of the page
		if (itemID) {

			// split method on strings
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. update the budget
			updateBudget();

			// 4 Calculate and Update the Percentages
			updatePercentages();
		}

	};

	// to make setupEventListeners public
	return {
		init: function() {
			console.log('Application has started.');
			UICtrl.displayMonth();
			UICtrl.displayBudget({ // to reset all values to 0 upon start of the application
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};
	

})(BudgetController, UIController);


// to initiate event listeners
controller.init();

























