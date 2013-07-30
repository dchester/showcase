require 'rubygems'
require 'selenium-webdriver'

class Collection

	attr_reader :title

	def initialize (driver, title, description, fields)

		number = Random.rand(10000)
		title += " " + number.to_s
		@title = title;

		element = driver.find_element :partial_link_text => 'New Collection'
		element.click

		wait = Selenium::WebDriver::Wait.new(:timeout => 10)
		wait.until { driver.title.downcase.start_with? "collection" }

		driver.find_element(:name => 'title').send_keys(title)
		driver.find_element(:name => 'description').send_keys(description)

		driver.find_element(:id => 'new_field').click
		wait.until { driver.find_element(:name => 'field_title') }

		driver.find_element(:name => 'field_title').send_keys(fields[:title])
		driver.find_element(:name => 'field_description').send_keys(fields[:description])

		driver.find_element(:class => 'save_fields').click
		driver.find_element(:id => 'save_collection').click

	end
end

describe "collections" do

	it "should create a new collection" do

		driver = Selenium::WebDriver.for :firefox
		driver.get "http://localhost:3000/admin/entities"

		collection = Collection.new(driver, 'Books', 'Featured books of the month', { :title => 'title' })

		alert = driver.find_element(:class => 'alert-success')
		alert.text.should == "Created new collection";

		content = driver.find_element(:class => 'content')
		content.text.should match /#{collection.title}/

		driver.find_element(:class => 'delete').submit
		driver.quit
	end

	it "should update a collection" do

		driver = Selenium::WebDriver.for :firefox
		driver.get "http://localhost:3000/admin/entities"

		collection = Collection.new(driver, 'Books', 'Featured books of the month', { :title => 'title' })

		driver.find_element(:partial_link_text => 'edit').click

		wait = Selenium::WebDriver::Wait.new(:timeout => 10)
		wait.until { driver.title == "Collection" }

		number = Random.rand(10000)
		title = collection.title + " " + number.to_s

		input = driver.find_element(:name => 'title')
		input.clear()
		input.send_keys(title)
		input.submit()

		driver.get "http://localhost:3000/admin/entities"

		content = driver.find_element(:class => 'content')
		content.text.should match /#{collection.title}/

		driver.find_element(:class => 'delete').submit
		driver.quit
	end
end

describe "items" do

	it "should create new items" do 

		driver = Selenium::WebDriver.for :firefox
		driver.get "http://localhost:3000/admin/entities"

		collection = Collection.new(driver, 'Books', 'Featured books of the month', { :title => 'title' })

		driver.find_element(:partial_link_text => collection.title).click

		wait = Selenium::WebDriver::Wait.new(:timeout => 10)
		wait.until { driver.title == "Items" }

		driver.find_element(:partial_link_text => 'Create New').click
		wait.until { driver.title == "Item" }

		driver.find_element(:name => 'title').send_keys('A Beautiful Title')	
		driver.find_element(:class => 'btn-primary').submit

		wait.until { driver.title == "Items" }

		content = driver.find_element(:class => 'content')
		content.text.should match /A Beautiful Title/

		driver.find_element(:class => 'delete').submit
		
		driver.get "http://localhost:3000/admin/entities"
		driver.find_element(:class => 'delete').submit
		driver.quit
		
	end
end


