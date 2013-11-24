require 'rubygems'
require 'selenium-webdriver'
require 'page-object'

class SignUpPage

	include PageObject

	text_field(:username, :name => 'username')
	button(:sign_up, :class => 'btn-primary')

	def sign_up_with (username)
		self.username = username
		self.sign_up
	end
end

class LoginPage

	include PageObject

	text_field(:username, :name => 'username')
	button(:log_in, :class => 'btn-primary')

	def log_in_with (username)
		self.username = username
		self.log_in
	end
end

class WorkspacesPage

	include PageObject

end

class WorkspacePage

	include PageObject

	text_field(:title, :name => 'title')
	text_field(:handle, :name => 'handle')
	text_field(:description, :name => 'description')

	button(:create, :class => 'btn-primary')

	def initialize_page
		self.navigate_to("http://localhost:3000/workspaces")
	end

	def create_with (title, handle, description)

		self.title = title
		self.handle = handle
		self.description = description
		self.create
	end
end

describe "test1" do 

	driver = Selenium::WebDriver.for :firefox
	p = WorkspacePage.new(driver)

=begin
	driver.get "http://localhost:3000/admin/login"

	wait = Selenium::WebDriver::Wait.new(:timeout => 10)
	wait.until { driver.title.downcase.start_with? "setup" }

	# sign up
	driver.find_element(:name => 'username').send_keys('admin')
	driver.find_element(:css => '.setup-form button').click

	# sign in
	driver.find_element(:name => 'username').send_keys('admin')
	driver.find_element(:css => '.login-form button').click

	# create a workspace
	driver.find_element(:link_text => 'New Workspace').click
	wait.until { driver.find_element(:name => 'title') }

	workspace_page = WorkspacePage.new(driver)
	workspace_page.create_with('test_workspace', 'test_workspace', 'test_workspace');

	# make a collection
	wait.until { driver.find_element(:link_text => 'test_workspace') }
	driver.find_element(:link_text => 'test_workspace').click

	wait.until { driver.find_element(:link_text => 'New Collection') }
	driver.find_element(:link_text => 'New Collection').click

	driver.find_element(:name => 'title').send_keys("books of the month")
	driver.find_element(:name => 'description').send_keys("books of the month")

	driver.find_element(:id => 'new_field').click
	wait.until { driver.find_element(:name => 'field_title') }

	driver.find_element(:name => 'field_title').send_keys('book title')
	driver.find_element(:name => 'field_description').send_keys('title of the book')

	driver.find_element(:class => 'save_fields').click
	driver.find_element(:id => 'save_collection').click
=end
	
end

=begin

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
		driver.get "http://localhost:3000/workspaces"

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

=end

